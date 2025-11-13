export const useDateFormatter = () => {
  const format = (value: string | number | Date) =>
    new Intl.DateTimeFormat('ru-ru', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(value));

  return { format };
};
