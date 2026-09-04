// Mongo records must be addressed by _id. The id/key fallbacks are only for
// records created by the offline/local workspace.
export const recordId = (record) =>
  String(record?._id ?? record?.id ?? record?.key ?? "");

export const mongoId = (record) =>
  record?._id === undefined || record?._id === null
    ? ""
    : String(record._id);

export const localRecord = (record, prefix) => ({
  ...record,
  id:
    record?.id ||
    `${prefix}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
});

// Never send a client-generated id/key as a Mongo update/create identifier.
export const apiPayload = (record = {}) => {
  const { id: _idAlias, key: _key, ...payload } = record;
  return payload;
};
