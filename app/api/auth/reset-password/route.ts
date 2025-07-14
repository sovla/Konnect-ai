import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 형식을 입력해주세요.' }, { status: 400 });
    }

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // 보안상 사용자가 존재하지 않아도 성공 메시지를 보냅니다
    // 이메일이 등록된 경우에만 실제로 재설정 링크를 전송할 것입니다
    if (existingUser) {
      // TODO: 실제 프로덕션에서는 이메일 전송 서비스를 연동해야 합니다
      // 예: SendGrid, AWS SES, Nodemailer 등
      console.log(`비밀번호 재설정 이메일을 ${email}로 전송해야 함`);
    }

    return NextResponse.json(
      {
        success: true,
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('비밀번호 재설정 에러:', error);

    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
