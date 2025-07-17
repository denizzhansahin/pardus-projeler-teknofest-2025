import React, { useState } from 'react';
import { ExerciseType } from '../types';
import { MoveIcon } from './icons/MoveIcon';
import { ZapIcon } from './icons/ZapIcon';
import { GridIcon } from './icons/GridIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { BotIcon } from './icons/BotIcon';
import { ArrowsExpandIcon } from './icons/ArrowsExpandIcon';
import { FocusIcon } from './icons/FocusIcon';
import { ChevronsRightIcon } from './icons/ChevronsRightIcon';
import { BookUpIcon } from './icons/BookUpIcon';
import { ScrollTextIcon } from './icons/ScrollTextIcon';

import MovingDotExercise from './exercises/MovingDotExercise';
import FlashingWordsExercise from './exercises/FlashingWordsExercise';
import SchulteTable from './exercises/SchulteTable';
import CustomTextExercise from './exercises/CustomTextExercise';
import AITextExercise from './exercises/AITextExercise';
import ExpansionExercise from './exercises/ExpansionExercise';
import FocusShiftExercise from './exercises/FocusShiftExercise';
import FocusForwardExercise from './exercises/FocusForwardExercise';
import EpubReaderExercise from './exercises/EpubReaderExercise';
import ScrollingReaderExercise from './exercises/ScrollingReaderExercise';


const exercises = [
  {
    type: ExerciseType.MovingDot,
    description: 'Göz kaslarınızı güçlendirmek için hareketli noktayı takip edin.',
    icon: <MoveIcon className="h-10 w-10 text-cyan-500 dark:text-cyan-400 mb-4" />,
  },
  {
    type: ExerciseType.FlashingWords,
    description: 'Kelime algılama hızınızı ve çevresel görüşünüzü geliştirin.',
    icon: <ZapIcon className="h-10 w-10 text-emerald-500 dark:text-emerald-400 mb-4" />,
  },
  {
    type: ExerciseType.SchulteTable,
    description: 'Çevresel görüşünüzü genişletin ve sayıları hızla bulun.',
    icon: <GridIcon className="h-10 w-10 text-amber-500 dark:text-amber-400 mb-4" />,
  },
   {
    type: ExerciseType.Expansion,
    description: 'Çevresel görüşünüzü genişletmek için artan kelime gruplarını okuyun.',
    icon: <ArrowsExpandIcon className="h-10 w-10 text-teal-500 dark:text-teal-400 mb-4" />,
  },
  {
    type: ExerciseType.FocusShift,
    description: 'Gözlerinizin odak değiştirme hızını ve isabetliliğini artırın.',
    icon: <FocusIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400 mb-4" />,
  },
  {
    type: ExerciseType.FocusForward,
    description: 'Geriye dönme alışkanlığını kırarak okuma akıcılığınızı artırın.',
    icon: <ChevronsRightIcon className="h-10 w-10 text-sky-500 dark:text-sky-400 mb-4" />,
  },
  {
    type: ExerciseType.CustomText,
    description: 'Kendi metninizi yapıştırarak kelime flaşlama alıştırması yapın.',
    icon: <FileTextIcon className="h-10 w-10 text-violet-500 dark:text-violet-400 mb-4" />,
  },
  {
    type: ExerciseType.AIText,
    description: 'Yapay zekadan istediğiniz konuda metin oluşturup egzersiz yapın.',
    icon: <BotIcon className="h-10 w-10 text-rose-500 dark:text-rose-400 mb-4" />,
  },
  {
    type: ExerciseType.EpubReader,
    description: 'EPUB kitabınızı yükleyerek hızlı okuma alıştırması yapın.',
    icon: <BookUpIcon className="h-10 w-10 text-orange-500 dark:text-orange-400 mb-4" />,
  },
  {
    type: ExerciseType.ScrollingReader,
    description: 'Kitabınızı kaydırarak, odaklanmış kelime takibi ile okuyun.',
    icon: <ScrollTextIcon className="h-10 w-10 text-lime-500 dark:text-lime-400 mb-4" />,
  },
];

const ExerciseView: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<ExerciseType | null>(null);

  const handleBack = () => setActiveExercise(null);

  if (activeExercise) {
    switch (activeExercise) {
      case ExerciseType.MovingDot:
        return <MovingDotExercise onBack={handleBack} />;
      case ExerciseType.FlashingWords:
        return <FlashingWordsExercise onBack={handleBack} />;
      case ExerciseType.SchulteTable:
        return <SchulteTable onBack={handleBack} />;
      case ExerciseType.CustomText:
        return <CustomTextExercise onBack={handleBack} />;
      case ExerciseType.AIText:
        return <AITextExercise onBack={handleBack} />;
      case ExerciseType.Expansion:
        return <ExpansionExercise onBack={handleBack} />;
      case ExerciseType.FocusShift:
        return <FocusShiftExercise onBack={handleBack} />;
       case ExerciseType.FocusForward:
        return <FocusForwardExercise onBack={handleBack} />;
      case ExerciseType.EpubReader:
        return <EpubReaderExercise onBack={handleBack} />;
      case ExerciseType.ScrollingReader:
        return <ScrollingReaderExercise onBack={handleBack} />;
      default:
        setActiveExercise(null);
        return null;
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
       <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Egzersiz Seçin</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Becerilerinizi geliştirmek için bir alıştırma seçin.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div
            key={exercise.type}
            onClick={() => setActiveExercise(exercise.type)}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center cursor-pointer
                       hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/10 hover:shadow-lg 
                       transform hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700"
          >
            {exercise.icon}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{exercise.type}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{exercise.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseView;