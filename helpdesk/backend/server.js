import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { randomUUID } from "crypto";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

const app = express();
const PORT = process.env.PORT || 7070;

app.use(cors());
app.use(bodyParser.json());

// Хранилище тикетов в памяти
let tickets = [
  {
    id: randomUUID(),
    name: "Не работает принтер",
    description: "Принтер не печатает, ошибка подключения",
    status: false,
    created: Date.now(),
  },
  {
    id: randomUUID(),
    name: "Обновить ПО",
    description: "Нужно обновить антивирус",
    status: true,
    created: Date.now(),
  },
];

app.get("/", (req, res) => {
  const { method, id } = req.query;

  switch (method) {
    case "allTickets":
      res.json(
        tickets.map(({ id, name, status, created }) => ({
          id,
          name,
          status,
          created,
        })),
      );
      break;

    case "ticketById":
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      res.json(ticket);
      break;

    case "deleteById":
      const index = tickets.findIndex((t) => t.id === id);
      if (index === -1)
        return res.status(404).json({ error: "Ticket not found" });
      tickets.splice(index, 1);
      res.status(204).send();
      break;

    default:
      res.status(400).json({ error: "Unknown method" });
  }
});

app.post("/", (req, res) => {
  const { method, id } = req.query;
  const data = req.body;

  switch (method) {
    case "createTicket":
      const newTicket = {
        id: randomUUID(),
        name: data.name,
        description: data.description || "",
        status: false,
        created: Date.now(),
      };
      tickets.push(newTicket);
      res.status(201).json(newTicket);
      break;

    case "updateById":
      const ticketIndex = tickets.findIndex((t) => t.id === id);
      if (ticketIndex === -1)
        return res.status(404).json({ error: "Ticket not found" });
      tickets[ticketIndex] = { ...tickets[ticketIndex], ...data };
      res.json(tickets[ticketIndex]);
      break;

    default:
      res.status(400).json({ error: "Unknown method" });
  }
});

app.listen(PORT, () => {
  logger.info(`Server started at http://localhost:${PORT}`);
});
