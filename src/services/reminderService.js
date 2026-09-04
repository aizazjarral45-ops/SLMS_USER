import { request } from "../api/client";

const normalizeReminder = (reminder) => ({
  ...reminder,
  id: String(reminder._id ?? reminder.id ?? reminder.key ?? ""),
});

export const listReminders = async () => {
  const result = await request("/reminders");
  return (result?.reminders || []).map(normalizeReminder);
};

export const createReminder = async (reminder) => {
  const result = await request("/reminders", {
    method: "POST",
    body: reminder,
  });
  return normalizeReminder(result.reminder);
};

export const toggleReminder = async (id) => {
  const result = await request(`/reminders/${id}/toggle`, { method: "PATCH" });
  return normalizeReminder(result.reminder);
};

export const deleteReminder = async (id) => {
  await request(`/reminders/${id}`, { method: "DELETE" });
};
