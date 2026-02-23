import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ message });
};
