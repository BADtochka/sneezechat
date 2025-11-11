import { MessageData } from '@/types/Message';
import { FC } from 'react';

type AuthorProps = {
  data: MessageData;
};

export const Author: FC<AuthorProps> = ({ data: message }) => {
  return (
    <div>
      <p className='line-clamp-1 text-xl font-bold' style={{ color: message.author.nameColor ?? 'white' }}>
        {message.author.name}
      </p>
    </div>
  );
};

// export const Author: FC<AuthorProps> = ({ kvas }) => {
// return <div>pisya {kvas}</div>;
// };

//^^^эхо войны со здравым смыслом 😭😭😭
