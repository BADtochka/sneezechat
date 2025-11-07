import keywords from 'emojilib';
import { useEffect, useRef, useState } from 'react';
import { default as emojis } from 'unicode-emoji-json';

export interface Emoji {
  name: string;
  slug: string;
  group: string;
  emoji_version: string;
  unicode_version: string;
  skin_tone_support: boolean;
  keywords: string[];
  native: string;
}

export const useEmoji = () => {
  const [findedEmojis, setFindedEmojis] = useState<Array<Emoji>>([]);
  const [query, setQuery] = useState('');
  const preloadedEmojisRef = useRef<Array<Emoji>>([]);

  useEffect(() => {
    const tempArray: Array<Emoji> = [];
    Object.keys(emojis).forEach((key) => {
      const emoji = emojis[key as keyof typeof emojis];
      tempArray.push({
        ...emoji,
        keywords: keywords[key as keyof typeof keywords],
        native: key,
      });
    });

    preloadedEmojisRef.current = tempArray;
  }, []);

  const findEmojis = (rawText: string) => {
    const match = rawText.match(/:(.*)/);

    if (!match) {
      setFindedEmojis([]);
      return;
    }

    const filteredEmojis = preloadedEmojisRef.current.filter((emoji) =>
      emoji.keywords.find((keyword) => keyword.includes(match[1].toLowerCase())),
    );

    setQuery(match[0]);
    setFindedEmojis(filteredEmojis);
  };

  return { findEmojis, findedEmojis, query };
};
