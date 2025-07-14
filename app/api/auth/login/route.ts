import { NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 모두 입력해주세요.' }, { status: 400 });
    }

    console.log(email, password);
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    console.log(result);

    if (result?.error) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    return NextResponse.json(
      {
        success: true,
        message: '로그인에 성공했습니다.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('로그인 에러:', error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: '인증 중 오류가 발생했습니다.' }, { status: 401 });
    }

    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
