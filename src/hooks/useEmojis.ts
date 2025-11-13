import { preloadedEmojisAtom } from '@/atoms/emojis';
import keywords from 'emojilib';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { default as emojis } from 'unicode-emoji-json';
import { getObjectKeys } from '../utils/getObjectKeys';

export const categories = [
  'Smileys & Emotion',
  'People & Body',
  'Animals & Nature',
  'Food & Drink',
  'Travel & Places',
  'Activities',
  'Objects',
  'Symbols',
  'Flags',
] as const;
export type EmojiCategory = (typeof categories)[number];

export interface Emoji {
  name: string;
  slug: string;
  group: EmojiCategory | (string & {});
  emoji_version: string;
  unicode_version: string;
  skin_tone_support: boolean;
  keywords: string[];
  native: string;
}

export const useEmoji = () => {
  const [findedEmojis, setFindedEmojis] = useState<Array<Emoji>>([]);
  const [query, setQuery] = useState('');
  const [preloadedEmojis, setPreloadedEmojis] = useAtom(preloadedEmojisAtom);
  const [categorizedEmojis, setCategorizedEmojis] = useState<Record<EmojiCategory, Emoji[]>>({
    'Animals & Nature': [],
    'Food & Drink': [],
    Activities: [],
    'Smileys & Emotion': [],
    'Travel & Places': [],
    'People & Body': [],
    Flags: [],
    Objects: [],
    Symbols: [],
  });

  useEffect(() => {
    if (preloadedEmojis.length > 0) return;

    const tempArray: Array<Emoji> = [];

    getObjectKeys(emojis).forEach((key) => {
      const emoji = emojis[key as keyof typeof emojis];
      tempArray.push({
        ...emoji,
        keywords: keywords[key as keyof typeof keywords],
        native: key,
      });
    });

    setPreloadedEmojis(tempArray);
  }, []);

  useEffect(() => {
    if (!preloadedEmojis.length) return;

    const categorizedObj = {} as Record<EmojiCategory, Emoji[]>;

    categories.forEach((category) => {
      categorizedObj[category] = preloadedEmojis.filter((e) => e.group === category);
    });

    setCategorizedEmojis(categorizedObj);
  }, [preloadedEmojis]);

  const findEmojiByChat = (rawText: string) => {
    const match = rawText.match(/:(.*)/);

    if (!match) {
      setFindedEmojis([]);
      setQuery('');
      return;
    }

    const filteredEmojis = preloadedEmojis.filter((emoji) =>
      emoji.keywords.find((keyword) => keyword.includes(match[1].toLowerCase())),
    );

    setQuery(match[0]);
    setFindedEmojis(filteredEmojis);
  };

  const findEmojiByPicker = (query: string) => {
    if (!query) {
      setFindedEmojis([]);
      return;
    }
    const filteredEmojis = preloadedEmojis.filter((emoji) =>
      emoji.keywords.find((keyword) => keyword.includes(query.toLowerCase())),
    );

    setFindedEmojis(filteredEmojis);
  };

  return { findEmojiByChat, findEmojiByPicker, setQuery, findedEmojis, query, preloadedEmojis, categorizedEmojis };
};
