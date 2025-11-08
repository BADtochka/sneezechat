import { FC } from 'react';

type SystemMessageProps = {
  text: string;
};

export const SystemMessage: FC<SystemMessageProps> = ({ text }) => {
  return <div className='flex w-full justify-center'>{text}</div>;
};
