const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors()); // Habilita o CORS para todas as rotas
app.use(express.json());

const connection = mysql.createConnection({
  host: '129.148.55.118',
  port: 3306, // Porta do MySQL
  user: 'QualityAdmin',
  password: '@Tesla1977',
  database: 'qualityseg_db',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

connection.query('CREATE DATABASE IF NOT EXISTS qualityseg_db', function (error, results, fields) {
  if (error) throw error;
  // Banco de dados criado ou já existente
});

connection.query('USE qualityseg_db', function (error, results, fields) {
  if (error) throw error;
  // Banco de dados selecionado para uso
});

connection.query(`CREATE TABLE IF NOT EXISTS cadastro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  senha VARCHAR(255)
)`, function (error, results, fields) {
  if (error) throw error;
  // Tabela criada ou já existente
});

app.post('/register', (req, res) => {
  const { email, senha } = req.body;
  const query = `INSERT INTO cadastro (email, senha) VALUES ('${email}', '${senha}')`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Usuário cadastrado com sucesso!');
  });
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const query = `SELECT * FROM cadastro WHERE email='${email}' AND senha='${senha}'`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      const user = result[0];
      const token = jwt.sign({ id: user.id, email: user.email }, 'secret_key');
      res.send({ success: true, token });
    } else {
      res.send({ success: false });
    }
  });
});

app.get('/protected', verifyToken, (req, res) => {
  res.send('Rota protegida! Acesso concedido.');
});

// Função de middleware para verificar o token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, 'secret_key', (err, decoded) => {
      if (err) {
        res.status(403).json({ success: false, message: 'Falha na autenticação do token.' });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Token não fornecido.' });
  }
}

app.listen(3000, () => {
  console.log('API ouvindo na porta 3000!');
});
