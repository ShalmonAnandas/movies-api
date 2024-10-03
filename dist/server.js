import express from 'express/index.js';
import routes from './routes/index.js';
const app = express();
app.use(express.json());
app.use('/', routes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map