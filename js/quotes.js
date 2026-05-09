const QUOTES = [
  {
    text: '每天进步1%，一年后你会强大37倍。',
    book: '《原子习惯》',
    author: 'James Clear'
  },
  {
    text: '习惯不是限制自由，而是创造自由。把自律变成习惯，你就不再需要意志力。',
    book: '《原子习惯》',
    author: 'James Clear'
  },
  {
    text: '你并没有达到目标的水平，你只是降到了你的系统所决定的水平。',
    book: '《原子习惯》',
    author: 'James Clear'
  },
  {
    text: '真正的改变始于接纳现在的自己，而不是否定自己。',
    book: '《原子习惯》',
    author: 'James Clear'
  },
  {
    text: '身份认同是习惯改变的北极星。你想要成为什么样的人，就会做什么样的事。',
    book: '《原子习惯》',
    author: 'James Clear'
  },
  {
    text: '不要成为过去的受害者，而要成为未来的建筑师。',
    book: '《终身成长》',
    author: 'Carol Dweck'
  },
  {
    text: '能力是可以通过努力培养的——这是成长型思维的核心信念。',
    book: '《终身成长》',
    author: 'Carol Dweck'
  },
  {
    text: '失败不是一个永久的状况，而是一个需要面对和解决的问题。',
    book: '《终身成长》',
    author: 'Carol Dweck'
  },
  {
    text: '尚未做到不等于做不到。',
    book: '《终身成长》',
    author: 'Carol Dweck'
  },
  {
    text: '学习的激情和韧性，是成长型思维者的标志。',
    book: '《终身成长》',
    author: 'Carol Dweck'
  },
  {
    text: '当你感到痛苦时，你正在成长。舒适区之外才是进步发生的地方。',
    book: '《刻意练习》',
    author: 'Anders Ericsson'
  },
  {
    text: '天才不是天生的，而是练出来的。没有与生俱来的天赋，只有刻意练习的积累。',
    book: '《刻意练习》',
    author: 'Anders Ericsson'
  },
  {
    text: '有目的的练习有四个特点：明确的目标、专注、反馈、走出舒适区。',
    book: '《刻意练习》',
    author: 'Anders Ericsson'
  },
  {
    text: '任何人都可以成为任何领域的专家，只要方法正确且足够努力。',
    book: '《刻意练习》',
    author: 'Anders Ericsson'
  },
  {
    text: '心理表征是刻意练习的核心概念。你训练得越多，你的心理表征就越精细。',
    book: '《刻意练习》',
    author: 'Anders Ericsson'
  },
  {
    text: '自律不是一种天赋，而是一种可以训练的习惯。',
    book: '《自控力》',
    author: 'Kelly McGonigal'
  },
  {
    text: '你的人生不是由偶尔的大事件决定的，而是由每天的小选择塑造的。',
    book: '《自控力》',
    author: 'Kelly McGonigal'
  },
  {
    text: '自控力的最佳策略不是增强意志力，而是减少 temptation 的暴露。',
    book: '《自控力》',
    author: 'Kelly McGonigal'
  },
  {
    text: '冥想是训练大脑自控力的最有效方法之一。',
    book: '《自控力》',
    author: 'Kelly McGonigal'
  },
  {
    text: '多巴胺的承诺让我们追求快乐，但真正的满足来自于完成后的成就感。',
    book: '《自控力》',
    author: 'Kelly McGonigal'
  },
  {
    text: '最好的学习方式就是去教别人。教是最好的学。',
    book: '《深度工作》',
    author: 'Cal Newport'
  },
  {
    text: '专注是这个时代最稀缺的能力。谁拥有深度专注，谁就拥有竞争力。',
    book: '《深度工作》',
    author: 'Cal Newport'
  },
  {
    text: '高质量工作产出 = 投入时间 × 专注程度。',
    book: '《深度工作》',
    author: 'Cal Newport'
  },
  {
    text: '社交媒体是深度工作最大的敌人。学会断网，才能深入。',
    book: '《深度工作》',
    author: 'Cal Newport'
  },
  {
    text: '你的注意力是你最宝贵的资源。把它投资在值得的地方。',
    book: '《深度工作》',
    author: 'Cal Newport'
  },
  {
    text: '高效能人士的第一个习惯：积极主动——在刺激与反应之间，你有选择的自由。',
    book: '《高效能人士的七个习惯》',
    author: 'Stephen Covey'
  },
  {
    text: '以终为始：在行动之前先在脑海中构想最终的结果。',
    book: '《高效能人士的七个习惯》',
    author: 'Stephen Covey'
  },
  {
    text: '要事第一：把重要的事放在第一位，不要让紧急的事占据你的全部时间。',
    book: '《高效能人士的七个习惯》',
    author: 'Stephen Covey'
  },
  {
    text: '双赢思维是人际交往的最高智慧。',
    book: '《高效能人士的七个习惯》',
    author: 'Stephen Covey'
  },
  {
    text: '知彼解己：先理解别人，再寻求被理解。',
    book: '《高效能人士的七个习惯》',
    author: 'Stephen Covey'
  },
  {
    text: '心流是幸福的终极状态——当你完全沉浸在一件事中时，时间会消失。',
    book: '《心流》',
    author: 'Mihaly Csikszentmihalyi'
  },
  {
    text: '挑战与技能的平衡是进入心流状态的关键。',
    book: '《心流》',
    author: 'Mihaly Csikszentmihalyi'
  },
  {
    text: '幸福不是偶然发生的，也不是金钱和权力能够买到的。它取决于我们如何利用内在资源。',
    book: '《心流》',
    author: 'Mihaly Csikszentmihalyi'
  },
  {
    text: '明确的目标、即时的反馈、可控的挑战——心流的三要素。',
    book: '《心流》',
    author: 'Mihaly Csikszentmihalyi'
  },
  {
    text: '不要在混乱中寻找秩序，而是创造秩序。心流就是内在秩序的建立。',
    book: '《心流》',
    author: 'Mihaly Csikszentmihalyi'
  },
  {
    text: '勇气不是没有恐惧，而是面对恐惧仍然行动。',
    book: '《被讨厌的勇气》',
    author: '岸见一郎'
  },
  {
    text: '所有的烦恼都来自人际关系，所有的幸福也来自人际关系。',
    book: '《被讨厌的勇气》',
    author: '岸见一郎'
  },
  {
    text: '人生不是线性的，而是连续的点。活在当下，认真过好每一个刹那。',
    book: '《被讨厌的勇气》',
    author: '岸见一郎'
  },
  {
    text: '课题分离：别人的事交给别人，自己的事全力以赴。',
    book: '《被讨厌的勇气》',
    author: '岸见一郎'
  },
  {
    text: '重要的不是你被给予了什么，而是你如何利用被给予的东西。',
    book: '《被讨厌的勇气》',
    author: '岸见一郎'
  },
  {
    text: '学习是唯一不会亏本的投资。知识会伴随你一生，谁也夺不走。',
    book: '—',
    author: '巴菲特'
  },
  {
    text: '种一棵树最好的时间是十年前，其次是现在。',
    book: '—',
    author: '佚名'
  },
  {
    text: '在信息爆炸的时代，学习能力是最重要的竞争力。',
    book: '—',
    author: 'Peter Drucker'
  },
  {
    text: '未来属于那些持续学习、不断提升自己的人。',
    book: '—',
    author: 'Alvin Toffler'
  },
  {
    text: '不要用战术上的勤奋掩盖战略上的懒惰。',
    book: '—',
    author: '雷军'
  },
  {
    text: '每天问自己三个问题：今天我学到了什么？我今天做得好的是什么？明天我如何做得更好？',
    book: '—',
    author: '佚名'
  },
  {
    text: '坚持不是一种选择，而是一种习惯。当你每天都做，它就不再是坚持。',
    book: '—',
    author: '佚名'
  },
  {
    text: '我不怕练过一万种踢法的人，我就怕把一种踢法练过一万次的人。',
    book: '—',
    author: '李小龙'
  },
  {
    text: '行动是治愈恐惧的良药，而犹豫和拖延将不断滋养恐惧。',
    book: '—',
    author: '佚名'
  },
  {
    text: '学习的本质是重复，但高质量的重复才是进步的关键。',
    book: '—',
    author: '佚名'
  },
  {
    text: '不要等待完美的时刻，抓住此刻，让它变得完美。',
    book: '—',
    author: '佚名'
  },
  {
    text: '你的大脑就像肌肉，越用越强。每天学习一点，就是在锻炼你的思维肌肉。',
    book: '—',
    author: '佚名'
  },
  {
    text: '成功的路上并不拥挤，因为坚持下来的人并不多。',
    book: '—',
    author: '佚名'
  },
  {
    text: '学习一门语言不是为了考试，而是为了打开一扇通往新世界的门。',
    book: '—',
    author: '佚名'
  },
  {
    text: 'AI不会取代你，但会用AI的人会取代你。',
    book: '—',
    author: '佚名'
  },
  {
    text: '在这个变革的时代，适应能力就是生存能力。',
    book: '—',
    author: '佚名'
  },
  {
    text: '每天读书10页，一年就是3650页，相当于10多本书。',
    book: '—',
    author: '佚名'
  },
  {
    text: '学习金字塔：教别人可以记住90%的内容，而只听讲只能记住5%。',
    book: '—',
    author: 'Edgar Dale'
  },
  {
    text: '知识不是力量，行动才是。知道却没有行动等于不知道。',
    book: '—',
    author: '佚名'
  },
  {
    text: '你所做的一切努力，都不会白费。它们只是在为你积蓄力量。',
    book: '—',
    author: '佚名'
  },
  {
    text: '当你想放弃的时候，想想当初为什么开始。',
    book: '—',
    author: '佚名'
  },
  {
    text: '人生没有白走的路，每一步都算数。你的每一次学习都在塑造未来的你。',
    book: '—',
    author: '佚名'
  }
];
