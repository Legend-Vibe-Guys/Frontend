export default {
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'deploy', 'chore', 'merge'],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    'subject-empty': [2, 'never'],
    'subject-case': [0],
    'subject-full-stop': [2, 'never', '.'],

    'header-max-length': [2, 'always', 72],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^([a-z]+)\s:\s(.+)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
};

/*
  [ Commit Message Convention ]
  형식: 타입 (공백) : (공백) 메시지 (소문자 권장, 이모지 금지)

  1. ✅ feat : 로그인 기능 구현 (성공: 한 칸 공백, 소문자)
  2. ❌ Feat : 로그인 기능 구현 (실패: 대문자 포함)
  3. ❌ feat: 로그인 기능 구현 (실패: 콜론 앞 공백 없음)
  4. ❌ feat  :  로그인 기능 구현 (실패: 공백 두 칸 이상)
  5. ❌ ✨ feat : 로그인 기능 구현 (실패: 이모지 포함)
*/
