export const transformLanguage = (language: string) => ({ javascript: 'JavaScript', java: 'Java' }[language]);
export const transformMethod = (method: string) =>
  ({ none: method, tdd: 'test driven development', 'pair-programming': 'pair programming', 'ping-pong': 'ping pong method' }[method]);
