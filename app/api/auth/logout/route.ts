import { NextResponse } from 'next/server';
import { signOut } from '@/auth';

export async function POST() {
  try {
    await signOut({ redirect: false });

    return NextResponse.json(
      {
        success: true,
        message: '로그아웃되었습니다.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('로그아웃 에러:', error);

    return NextResponse.json({ error: '로그아웃 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
