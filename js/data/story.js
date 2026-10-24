/* 星降町的放学后 · 主线事件 */
window.DATA = window.DATA || {};

/* 事件执行时，g 提供：say(text,k) / aff(id,n) / set(k,v) / flag(k) / quest(t) / opt(...) */
DATA.story = [

  /* ══════ 第一章 · 招人 ══════ */

  {
    id: 'e_enter_dome',
    when: (S) => !S.flags.join_haruka,
    place: 'dome',
    run: (g) => {
      g.say('楼梯第三级「咯」了一声。');
      g.say('推开门，一股旧纸和灰尘的味道涌出来。');
      g.say('屋子正中间立着一个很大的东西，黄铜的，像一只被拆掉翅膀的昆虫。');
      g.say('一个女生坐在长桌后面，抬头看你。');
      g.say('「你就是转学生。」她说，不是问句。');
      g.say('「……是。」');
      g.say('「天野遥。三年A班，天象仪社社长。」她把铅笔放下，「这个社现在只有一个人。你要不要来。」');
      g.say('「……你不先介绍一下社团在做什么吗。」');
      g.say('「看星星。」她说，「就这样。」');
      g.say('她把一张纸推过来。是社团申请表，上面「人数」那一栏已经写了「一」，后面空着。');
      g.quest('在「天野遥」面前输入「填表」，加入天象仪社');
    },
  },

  {
    id: 'e_join_haruka',
    when: (S) => S.flags.table_filled && !S.flags.join_haruka,
    place: 'dome',
    run: (g) => {
      g.set('join_haruka', true);
      g.aff('haruka', 5);
      g.say('「填好了。」你把表推回去。');
      g.say('她低头看了一眼，然后在「二」后面补上了一个很小的「人」字。');
      g.say('「欢迎。」她说，「你是这个社两年来第一个新社员。」');
      g.say('「两年？」');
      g.say('「上一个毕业了。」她把表夹进文件夹，「顺便说一句，九月社团审查。人数不够三人，废部。」');
      g.say('「……等一下。」');
      g.say('「所以，」她抬起头，「接下来六个月，你要帮我再找两个人。」');
      g.quest('招到另外两名社员（去认识学校里的人）');
      g.chapter(1);
    },
  },

  {
    id: 'e_first_rin',
    when: (S) => !S.flags.met_rin && S.day >= 2,
    place: 'library',
    run: (g) => {
      g.set('met_rin', true);
      g.say('图书室里只有一个女生。她坐在窗边，桌上摊着一本书，但你一进门，她的眼睛就抬起来了。');
      g.say('「转学生。」她说，「四月三号来的，坐靠窗第三张桌子。」');
      g.say('「……你怎么知道。」');
      g.say('「我在观察人类。」她合上书，「顺便说一句，你昨天在便利店买了两份关东煮。」');
      g.say('「那是我晚饭。」');
      g.say('「我知道。我只是想看看你会不会编个更好的谎。」');
      g.quest('和图书室的小鸟游铃说说话');
    },
  },

  {
    id: 'e_first_hina',
    when: (S) => !S.flags.met_hina && S.day >= 3,
    place: 'track',
    run: (g) => {
      g.set('met_hina', true);
      g.say('跑道上有人在跑。你还没走近，那个人就自己跑过来了。');
      g.say('「啊！你是那个转学生！」她急刹车，差点撞到你，「二年B班的，仓桥悠！」');
      g.say('「你怎么知道。」');
      g.say('「全校的转学生只有你一个啊。」她说得理所当然。');
      g.quest('和操场上的日向阳菜说说话');
    },
  },

  {
    id: 'e_first_mio',
    when: (S) => !S.flags.met_mio && S.day >= 4,
    place: 'infirmary',
    run: (g) => {
      g.set('met_mio', true);
      g.say('保健室里没有人。帘子拉开一半，靠窗的床上坐着一个女生。');
      g.say('她腿上也盖着被子，手里拿着一本书，听到声音，慢慢抬起头。');
      g.say('「你不是来躺下的。」她说。');
      g.say('「……你怎么知道。」');
      g.say('「来躺下的人，进门会先看床。」她说，「你看的是我。」');
    },
  },

  {
    id: 'e_join_rin',
    when: (S) => S.aff.rin >= 16 && !S.flags.join_rin,
    place: 'library',
    run: (g) => {
      g.set('join_rin', true);
      g.aff('rin', 5);
      g.say('「小鸟游。」你坐在她对面，「天象仪社缺人。」');
      g.say('「我知道。」她翻过一页，「缺得快要废部了。」');
      g.say('「你要不要来。」');
      g.say('她终于抬头。「理由。」');
      g.say('「因为你说过，你想写这个镇子。」你说，「而这个镇子晚上最好看的东西，在我们社的屋子里。」');
      g.say('她盯着你看了很久。');
      g.say('「……行。」她说，「不过我有个条件。」');
      g.say('「什么条件。」');
      g.say('「我要随时观察你。」她把书收进包里，「毕竟你是我目前最感兴趣的样本。」');
      g.joinNotice('小鸟游铃');
    },
  },

  {
    id: 'e_join_hina',
    when: (S) => S.aff.hina >= 20 && !S.flags.join_hina,
    place: 'track',
    run: (g) => {
      g.set('join_hina', true);
      g.aff('hina', 5);
      g.say('「阳菜，你有没有兴趣加一个社团。」');
      g.say('「我？田径部啊。」');
      g.say('「兼一个。」');
      g.say('「兼？」她歪头，「可以那种事吗。」');
      g.say('「可以。天象仪社，只有三个人不到。」');
      g.say('「天象仪……」她想了想，「就是那个圆圆的东西？晚上能看星星的？」');
      g.say('「对。」');
      g.say('她突然笑起来，笑得很响。「好啊！」');
      g.say('「这么快就答应？」');
      g.say('「因为那个屋子有灯嘛。」她说，「而且训练完正好能上去。」');
      g.joinNotice('日向阳菜');
    },
  },

  {
    id: 'e_join_mio',
    when: (S) => S.aff.mio >= 24 && !S.flags.join_mio,
    place: 'infirmary',
    run: (g) => {
      g.set('join_mio', true);
      g.aff('mio', 5);
      g.say('「月见。」');
      g.say('「嗯。」');
      g.say('「天象仪社在招人。」');
      g.say('她抬起头，第一次露出有点像笑的表情。「你在招一个不出教室的人。」');
      g.say('「你出得去。」');
      g.say('「为什么找我。」');
      g.say('「因为你说过，你在等一台机器。」');
      g.say('屋子里静了很久。');
      g.say('「……好。」她说，「不过我不能保证每次都去。」');
      g.say('「没关系。」');
      g.say('「你这个人，」她低头，把书翻到某一页，「真是奇怪。」');
      g.joinNotice('月见澪');
    },
  },

  {
    id: 'e_three_members',
    when: (S) => S.flags.join_haruka &&
      [S.flags.join_rin, S.flags.join_hina, S.flags.join_mio].filter(Boolean).length >= 2 && !S.flags.three_ok,
    run: (g) => {
      g.set('three_ok', true);
      g.say('社务日志上，人数那一栏终于写到了「三」。');
      g.say('天野遥把日志合上，看了很久。');
      g.say('「这样就不会废部了。」她说。');
      g.say('「嗯。」');
      g.say('「那接下来，」她站起来，走到那台黄铜机器旁边，「就得让它转起来。」');
      g.quest('让天象仪转起来（去问问御崎老师）');
    },
  },

  /* ══════ 第二章 · 修好它 ══════ */

  {
    id: 'e_light_problem',
    when: (S) => S.flags.three_ok && !S.flags.light_problem,
    place: 'dome',
    run: (g) => {
      g.set('light_problem', true);
      g.say('遥把天象仪的底座打开，露出一个空空的灯泡座。');
      g.say('「灯泡没了。」她说，「这种灯泡是特制的，一千瓦，球形，灯丝是手工绕的。」');
      g.say('「哪儿能买？」');
      g.say('「德国。订一只两万日元，四个月。」');
      g.say('你算了算日子。「星见祭在八月。」');
      g.say('「嗯。」她说，「来不及。」');
      g.quest('想别的办法让穹顶亮起来（去理科室问御崎老师）');
    },
  },

  {
    id: 'e_mizaki_projection',
    when: (S) => S.flags.light_problem && !S.flags.mizaki_idea,
    place: 'lab',
    run: (g) => {
      g.set('mizaki_idea', true);
      g.say('御崎老师听完，把脚从椅子上放下来。');
      g.say('「灯泡没有，投影仪倒是有一台。」她指了指柜子，「学校以前放幻灯片的，老古董，还能亮。」');
      g.say('「投影仪能当天象仪用？」');
      g.say('「不能。」她说，「投出来是平的，不是圆的。但你们的穹顶是白的。」');
      g.say('她伸出两根手指。「投影仪，加一匹白布，把星图打在布上。丑，但是能看。」');
      g.say('「需要什么。」');
      g.say('「一台能用的投影仪，一匹够大的白布，一整个暑假。」她顿了顿，「还有，得有人画星图。」');
      g.quest('找齐三样东西：投影仪（理科室）、白布（体育器材室）、还有画星图的人');
    },
  },

  {
    id: 'e_get_projector',
    when: (S) => S.flags.mizaki_idea && !S.flags.have_projector,
    place: 'lab',
    run: (g) => {
      g.set('have_projector', true);
      g.say('投影仪从柜子里搬出来，比想象的重。铁壳，上面有个手写的标签：「昭和五十八年购入」。');
      g.say('「你确定这个还能用？」');
      g.say('御崎老师插上电，按了开关。机器嗡了一声，镜头里透出一块黄色的方光。');
      g.say('「能亮。」她说，「能不能撑一晚，就看你们运气了。」');
      g.say('【拿到：旧投影仪】');
    },
  },

  {
    id: 'e_get_cloth',
    when: (S) => S.flags.mizaki_idea && !S.flags.have_cloth,
    place: 'track',
    run: (g) => {
      g.set('have_cloth', true);
      g.say('器材室的角落里堆着一匹白布，是以前运动会挂横幅用的。');
      g.say('「这个行不行？」你抖开一角，上面的灰扬起来。');
      g.say('阳菜凑过来看。「可以吧？就是有点黄。」');
      g.say('「洗干净应该还行。」');
      g.say('「我来洗！」她已经开始卷袖子了，「反正今天训练完了。」');
      g.say('【拿到：白布一匹】');
      g.aff('hina', 3);
    },
  },

  {
    id: 'e_draw_stars',
    when: (S) => S.flags.mizaki_idea && !S.flags.stars_drawn,
    place: 'library',
    run: (g) => {
      g.set('stars_drawn', true);
      g.say('铃面前摊着一张很大的纸，纸上已经画了一半的星座。');
      g.say('「你画的？」');
      g.say('「不然呢。」她头也不抬，「社里有人会画吗。」');
      g.say('「天野会。」');
      g.say('「她要修机器。」铃说，「而且她的手在抖。」');
      g.say('「……你怎么知道。」');
      g.say('她笔停了一下。「我观察人类。」');
      g.say('「这张画完要多久。」');
      g.say('「八十八个星座，」她吹了吹墨，「一个暑假。」');
      g.say('【星图：开始绘制】');
      g.aff('rin', 4);
    },
  },

  {
    id: 'e_fix_dome',
    when: (S) => S.flags.stars_drawn && !S.flags.dome_fixed,
    place: 'dome',
    run: (g) => {
      g.set('dome_fixed', true);
      g.say('穹顶上的那道裂缝，用胶带补过，但补得歪歪扭扭。');
      g.say('你踩上梯子，把旧胶带撕下来。灰尘落了一脸。');
      g.say('下面有人说：「往左一点。」');
      g.say('低头看，澪扶着梯子。她今天居然来了。');
      g.say('「你怎么上来的。」');
      g.say('「走上来的。」她说，「三级台阶会响，我记住了。」');
      g.say('你们把新的补丁贴上去，白色的布在穹顶上拉开，像一小片云。');
      g.say('「这样就好了。」她说。');
      g.aff('mio', 4);
    },
  },

  {
    id: 'e_test_projection',
    when: (S) => S.flags.dome_fixed && S.flags.have_projector && !S.flags.tested,
    place: 'dome',
    run: (g) => {
      g.set('tested', true);
      g.say('天黑以后，四个人都留在了屋子里。');
      g.say('投影仪放在长桌上，镜头对着穹顶。开关一按，机器嗡了一声。');
      g.say('一道黄色的光柱打上去，落在白布补丁的位置。');
      g.say('「……偏了。」遥说。');
      g.say('你转了转底座。光圈慢慢移到穹顶中间，然后出现了一片模糊的白点。');
      g.say('「是猎户座。」遥说。她的声音有点不一样。');
      g.say('屋子里没有人说话。');
      g.say('光很暗，星图很糙，投影仪的散热风扇响得像拖拉机。');
      g.say('但是那一刻，穹顶上有星星。');
      g.chapter(2);
      g.quest('星见祭之前，把这件事做成真的');
    },
  },

  /* ══════ 第三章 · 夏天的事 ══════ */

  {
    id: 'e_festival_crisis',
    when: (S) => S.flags.tested && !S.flags.festival_crisis,
    place: 'street',
    run: (g) => {
      g.set('festival_crisis', true);
      g.say('通学路的海报被撕了一半，露出下面的旧胶印。');
      g.say('一个老人在墙边贴新告示。你凑过去看。');
      g.say('「关于第八十四回星见祭延期举办的通知」');
      g.say('「延期？」');
      g.say('「停办。」老人叹了口气，「町议会说，今年预算不够，灯也坏了。」');
      g.say('「灯？」');
      g.say('「神社那一百零八盏灯笼。有人认捐的才有灯，今年认捐的少了三十七户。」');
      g.quest('想办法帮星见祭保住（去神社看看）');
    },
  },

  {
    id: 'e_shrine_plan',
    when: (S) => S.flags.festival_crisis && !S.flags.shrine_plan,
    place: 'shrine',
    run: (g) => {
      g.set('shrine_plan', true);
      g.say('神社的宫司是个很老的人，坐在本殿前的台阶上。');
      g.say('「你也来问祭典的事。」');
      g.say('「嗯。」');
      g.say('「办不成了。」他指了指绘马架，「现在的孩子，谁还来看星星。都看手机。」');
      g.say('你抬头看那盏最上面的灯笼。上面写着一个名字，墨迹很淡。');
      g.say('「如果把观测会办在这儿呢。」');
      g.say('老人抬头看你。');
      g.say('「星见祭那天，天象仪社在这里架一台机器。」你说，「让全镇的人看一次星星。这样算不算数。」');
      g.say('他看了你很久，然后慢慢笑起来。「算。当然算。」');
      g.quest('凑齐三个人，在星见祭当晚去神社办观测会');
    },
  },

  {
    id: 'e_summer_festival',
    when: (S) => S.day >= 16 && !S.flags.summer_done,
    place: 'seawall',
    run: (g) => {
      g.set('summer_done', true);
      g.say('八月的第一个周末，镇上有个小型的夏日祭。规模不大，但花火是真的。');
      g.say('你坐在防波堤上。堤上已经坐了几个人，都是自己来的。');
      g.say('第一发花火升上来的时候，海面亮了一下。');
      g.say('「好吵。」旁边有人说。');
      g.say('转头，铃坐在离你两米的地方，手里拿着苹果糖，一口没吃。');
      g.say('「你怎么在这儿。」');
      g.say('「观察人类。」她说，「顺便，这糖太甜了。」');
      g.say('第二发。海面又亮了一下。');
      g.say('「仓桥。」她忽然说，「你会一直待在这个镇上吗。」');
      g.say('你没回答。因为你自己也不知道。');
      g.aff('rin', 4);
      g.chapter(3);
    },
  },

  {
    id: 'e_walk_night',
    when: (S) => S.aff.hina >= 40 && !S.flags.walked_home,
    place: 'track',
    run: (g) => {
      g.set('walked_home', true);
      g.say('训练结束的时候，天已经黑透了。操场上的灯坏了两盏。');
      g.say('阳菜站在跑道边上，抱着膝盖，没动。');
      g.say('「怎么了。」');
      g.say('「……没事。」她的声音有点小，「就是，今天灯坏得有点多。」');
      g.say('你看了看校门的方向。从这里走过去，要经过一整段没有灯的路。');
      g.say('「我送你。」');
      g.say('「诶？」');
      g.say('「我说，我送你。」');
      g.say('她站起来，动作很快。「那、那我走快点。」');
      g.say('走到校门口，她突然说：「学长。」');
      g.say('「嗯。」');
      g.say('「明天，你还来吗。」');
      g.say('「来。」');
      g.aff('hina', 6);
    },
  },

  /* ══════ 第四章 · 星见祭 ══════ */

  {
    id: 'e_rehearsal',
    when: (S) => S.day >= 20 && S.flags.shrine_plan && !S.flags.rehearsed,
    place: 'dome',
    run: (g) => {
      g.set('rehearsed', true);
      g.say('最后一次彩排。');
      g.say('投影仪、白布、星图，全都搬到神社去试了一遍。');
      g.say('宫司在旁边看，一句话也没说。等你们收好东西，他才开口：「这些石头，在这儿待了六十年。」');
      g.say('「镇上的人以前管它们叫星见石。每年那天晚上，大家都会上来摸一下。」');
      g.say('「后来呢。」');
      g.say('「后来就没人上来了。」他说，「今年，说不定能再来一次。」');
      g.chapter(4);
      g.quest('星见祭当晚（第 24 天）到神社去');
    },
  },

  {
    id: 'e_festival_day',
    when: (S) => S.day >= 23 && !S.flags.festival_open,
    run: (g) => {
      g.set('festival_open', true);
      g.say('镇上开始热闹起来了。');
      g.say('神社前搭起了棚子，灯笼一盏一盏挂上去。有人在试花火，天上响了一声很闷的爆响。');
      g.say('明天就是星见祭。');
      g.quest('第 24 天：去神社，把观测会办完');
    },
  },
];
