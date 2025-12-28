import { NextResponse } from 'next/server';

interface CBRResponse {
  Valute: {
    EUR: {
      Value: number;
    };
  };
}

export async function GET() {
  try {
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', {
      next: { revalidate: 3600 } // Кеш на 1 час
    });

    if (!response.ok) {
      throw new Error('CBR API error');
    }

    const data: CBRResponse = await response.json();
    const rate = data.Valute.EUR.Value;

    return NextResponse.json({
      rate,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to fetch EUR rate:', error);
    // Фоллбэк курс
    return NextResponse.json({
      rate: 105,
      timestamp: Date.now(),
      fallback: true
    });
  }
}