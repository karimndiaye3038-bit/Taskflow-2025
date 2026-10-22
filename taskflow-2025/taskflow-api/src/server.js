require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet({ contentSecurityPolicy: false })); // CSP désactivée pour Swagger UI
app.use(cors({ origin: process.env.CLIENT_URL === '*' || !process.env.CLIENT_URL ? true : process.env.CLIENT_URL.split(',') }));
app.use(express.json());

// Documentation interactive
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'TaskFlow API Docs' }));

app.get('/', (req, res) => res.json({ message: 'TaskFlow API 🚀', docs: '/api-docs' }));

// Routes
app.use('/api', require('./routes/authRoutes'));        // /auth/* et /users/me
app.use('/api/users', require('./routes/adminRoutes')); // gestion des utilisateurs (ADMIN)
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/statsRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT} `)));
}

module.exports = app;
