
'use client';

import { useState, useEffect } from 'react';

export function LiveDate() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 60000); // Update once a minute is enough for the date

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="hidden items-center justify-center rounded-md bg-muted px-3 py-1.5 text-sm font-medium lg:flex">
      {formattedDate}
    </div>
  );
}

export function LiveTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="hidden items-center justify-center rounded-md bg-muted px-3 py-1.5 text-sm font-medium lg:flex">
      {formattedTime}
    </div>
  );
}
