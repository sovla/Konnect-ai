'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, Phone, Bike, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerSchema, type RegisterFormData } from '@/app/lib/schemas';
import { RedirectIfAuthenticated } from '@/app/components';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      vehicleType: 'MOTORCYCLE',
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  // 전화번호 자동 포맷팅
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
    let formatted = value;

    if (value.length >= 3) {
      formatted = value.slice(0, 3) + '-';
      if (value.length >= 7) {
        formatted += value.slice(3, 7) + '-' + value.slice(7, 11);
      } else {
        formatted += value.slice(3);
      }
    }

    setValue('phone', formatted);
  };

  // 회원가입 제출
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
          vehicleType: data.vehicleType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError('root', {
          message: result.error || '회원가입 중 오류가 발생했습니다.',
        });
        return;
      }

      // 회원가입 성공 - 로그인 페이지로 이동
      router.push('/auth/login?message=registration-success');
    } catch (error) {
      console.error('회원가입 에러:', error);
      setError('root', {
        message: '회원가입 중 오류가 발생했습니다.',
      });
    }
  };

  const vehicleOptions = [
    { value: 'MOTORCYCLE', label: '오토바이', icon: '🏍️' },
    { value: 'BICYCLE', label: '자전거', icon: '🚲' },
    { value: 'CAR', label: '자동차', icon: '🚗' },
  ];

  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* 로고 및 제목 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Konnect AI 가입하기</h2>
            <p className="mt-2 text-sm text-gray-600">
              AI 기반 스마트 배달 대시보드로 더 효율적인 배달 업무를 시작하세요
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
            {/* 에러 메시지 */}
            {errors.root && (
              <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* 이름 입력 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('name')}
                    id="name"
                    type="text"
                    autoComplete="name"
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* 이메일 입력 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일 주소
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`appearance-none block w-full pl-10 pr-10 py-3 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="비밀번호를 입력하세요"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              {/* 비밀번호 확인 입력 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`appearance-none block w-full pl-10 pr-10 py-3 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* 전화번호 입력 (선택사항) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  휴대폰 번호 <span className="text-gray-500">(선택사항)</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('phone')}
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    onChange={handlePhoneChange}
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="010-0000-0000"
                  />
                </div>
                {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              {/* 운송 수단 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">주요 운송 수단</label>
                <div className="grid grid-cols-1 gap-3">
                  {vehicleOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        watch('vehicleType') === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <input {...register('vehicleType')} type="radio" value={option.value} className="sr-only" />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{option.icon}</span>
                        <div>
                          <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                        </div>
                      </div>
                      {watch('vehicleType') === option.value && (
                        <div className="absolute top-3 right-3">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <Bike className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    {...register('agreeToTerms')}
                    id="agreeToTerms"
                    type="checkbox"
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      errors.agreeToTerms ? 'border-red-300' : ''
                    }`}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                      이용약관
                    </Link>
                    에 동의합니다 <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>}

                <div className="flex items-start">
                  <input
                    {...register('agreeToPrivacy')}
                    id="agreeToPrivacy"
                    type="checkbox"
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      errors.agreeToPrivacy ? 'border-red-300' : ''
                    }`}
                  />
                  <label htmlFor="agreeToPrivacy" className="ml-2 block text-sm text-gray-700">
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                      개인정보처리방침
                    </Link>
                    에 동의합니다 <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.agreeToPrivacy && <p className="text-sm text-red-600">{errors.agreeToPrivacy.message}</p>}
              </div>

              {/* 회원가입 버튼 */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } transition-colors`}
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                  </span>
                  {isSubmitting ? '가입 처리 중...' : '회원가입'}
                </button>
              </div>

              {/* 로그인 링크 */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  이미 계정이 있으신가요?{' '}
                  <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    로그인하기
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* 추가 정보 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              회원가입을 진행하시면{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                이용약관
              </Link>{' '}
              및{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                개인정보처리방침
              </Link>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}
