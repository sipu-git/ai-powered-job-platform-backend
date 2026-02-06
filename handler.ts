export const lambdaHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
};
