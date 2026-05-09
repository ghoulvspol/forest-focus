import type { Member } from '../types';

const firstNames = ['张','李','王','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗'];
const lastNames = ['伟','芳','娜','秀英','敏','静','丽','强','磊','洋','艳','勇','军','杰','娟','涛','明','超','秀兰','霞',
  '平','刚','桂英','文','华','飞','玲','建','建华','建国','建军','建平','建民','建国','志强','志明','志华','国强','国华','国明',
  '海','波','鑫','宇','辉','峰','浩','然','博','昊'];

const roles = ['前端工程师','后端工程师','产品经理','UI设计师','测试工程师','运维工程师','数据分析师','架构师','技术主管','项目经理'];
const departments = ['技术部','产品部','设计部','测试部','数据部'];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

const rand = seededRandom(42);

export const members: Member[] = Array.from({ length: 50 }, (_, i) => {
  const id = `m${i + 1}`;
  const teamIndex = Math.floor(i / 10);
  const teamId = `t${teamIndex + 1}`;
  const fn = firstNames[Math.floor(rand() * firstNames.length)];
  const ln = lastNames[Math.floor(rand() * lastNames.length)];
  return {
    id,
    name: fn + ln,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${id}`,
    department: departments[teamIndex],
    teamId,
    role: roles[Math.floor(rand() * roles.length)],
    joinDate: `2024-0${Math.floor(rand() * 9) + 1}-${String(Math.floor(rand() * 28) + 1).padStart(2, '0')}`,
  };
});
