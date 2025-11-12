import { nicknameColorAtom } from '@/routes/auth';
import { useClickOutside } from '@mantine/hooks';
import { Sketch } from '@uiw/react-color';
import { useAtom } from 'jotai';
import { FC, useState } from 'react';

type ColorPickerProps = {
  onColorChange: (hexColor: string) => void;
};

export const ColorPicker: FC<ColorPickerProps> = ({ onColorChange }) => {
  const ref = useClickOutside(() => setShowColorPicker(false));

  const [nickNameColor, setNickNameColor] = useAtom(nicknameColorAtom);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleClick = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleChange = (hexColor: string) => {
    setNickNameColor(hexColor);
    onColorChange(hexColor);
  };

  return (
    <>
      <div
        style={{ backgroundColor: nickNameColor }}
        className='h-[1.5em] w-[1.5em] cursor-pointer'
        onClick={handleClick}
      />
      {showColorPicker && (
        <div className='absolute! top-[calc(100%+16px)] right-0 z-2 rounded-2xl border border-zinc-700 bg-zinc-900 p-2'>
          <Sketch
            ref={ref}
            color={nickNameColor}
            disableAlpha
            className='bg-transparent! p-0! shadow-none! *:nth-[2]:hidden! *:nth-[3]:hidden!'
            onChange={(color) => {
              handleChange(color.hex);
            }}
          />
        </div>
      )}
    </>
  );
};
