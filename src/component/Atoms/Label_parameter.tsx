import React from 'react'

import style from './css/detail.module.css';

interface DetailProps{
    title: string;
    result: string|null;
    resultNumber: number|null;
    stauts: boolean;
}

const Detail: React.FC<DetailProps> = ({ title, result, resultNumber, stauts }) => {
  return (
    <div className={style.content}>
        <strong className={stauts ? style.selected : ''}>{title}:</strong>
        {result !== null &&(
            <p className={stauts ? style.selected : ''}>{result}</p>
        )}
        {resultNumber !== null &&(
            <p className={stauts ? style.selected : ''}>{resultNumber}</p>
        )}
    </div>
  )
}

export default Detail