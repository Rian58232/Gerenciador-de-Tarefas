const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let tarefas = [];
let idCounter = 1;

// Função para limpar tarefas com mais de 24h passadas
function limparTarefasAntigas() {
  const now = new Date();
  tarefas = tarefas.filter(tarefa => {
    const tarefaDateTime = new Date(tarefa.data + 'T' + tarefa.hora + ':00');
    const diff = now - tarefaDateTime;
    return diff <= 24 * 60 * 60 * 1000; // até 24h depois do horário da tarefa
  });
}

// Rota para listar tarefas (com filtro opcional por status)
app.get('/tarefas', (req, res) => {
  limparTarefasAntigas();
  const { status } = req.query;
  let resultado = tarefas;
  if (status) {
    if (!['pendente', 'concluído'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido no filtro.' });
    }
    resultado = tarefas.filter(t => t.status === status);
  }
  res.json(resultado);
});

// Rota para adicionar tarefa
app.post('/tarefas', (req, res) => {
  const { titulo, data, hora, categoria, status } = req.body;
  if (!titulo || !data || !hora || !categoria || !status) {
    return res.status(400).json({ error: 'Faltam campos obrigatórios.' });
  }
  const novaTarefa = {
    id: idCounter++,
    titulo,
    data,
    hora,
    categoria,
    status
  };
  tarefas.push(novaTarefa);
  res.status(201).json(novaTarefa);
});

// Rota para deletar tarefa por id
app.delete('/tarefas/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tarefas.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }
  tarefas.splice(index, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
