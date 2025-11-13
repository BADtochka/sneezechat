import { useDateFormatter } from '@/hooks/useDateFormatter';
import { MessageData } from '@/types/Message';
import { FC } from 'react';

type AuthorProps = {
  data: MessageData;
};

export const Author: FC<AuthorProps> = ({ data: message }) => {
  const { format } = useDateFormatter();

  return (
    <div className='flex flex-row'>
      <p className='line-clamp-1 flex-1 text-xl font-bold' style={{ color: message.author.nameColor ?? 'white' }}>
        {message.author.name}
      </p>
      <p className='text-x line-clamp-2 text-zinc-600'>{format(message.createdAt)}</p>
    </div>
  );
};

// export const Author: FC<AuthorProps> = ({ kvas }) => {
// return <div>pisya {kvas}</div>;
// };

//^^^эхо войны со здравым смыслом 😭😭😭
