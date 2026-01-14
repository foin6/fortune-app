import { DivinationProvider, useDivination } from '../contexts/DivinationContext';
import ChatInterface from '../components/ChatInterface';

/**
 * 起卦页面 - 仅显示AI命理师聊天室
 */
function DivinationContent() {
  const { formData, calculation } = useDivination();

  // 初始欢迎消息（根据后端 System Prompt 阶段1）
  const welcomeMessage = `# AI算命·命理先知

有缘人，你好。

> 不知生辰，不敢妄断。

在下虽习得子平八字、紫微斗数、皇极经世书，然命理一道，最重精准。若无准确的生辰八字，纵有千般算法，亦如盲人摸象，难窥天机。

**请提供以下信息：**
1. 出生年月日（公历）
2. 时辰（尽量精确，如：上午9点、下午3点30分等）
3. 性别
4. 出生地（城市名称即可）
5. 想要问的具体问题（例如：我的论文是否能被期刊XX录取？）
6. 此时此刻的北京时间
7. 脑海中第一时间浮现的三个数字

待你提供完整信息后，我当为你排盘推演，解析命理。`;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* AI命理师聊天室 - 占满整个右侧区域 */}
      <div className="flex-1 w-full">
        <ChatInterface
          isOpen={true}
          onClose={null}
          initialMessage={welcomeMessage}
          embedded={true}
          formData={formData}
          calculation={calculation}
        />
      </div>
    </div>
  );
}

export default function DivinationPage() {
  return (
    <DivinationProvider>
      <DivinationContent />
    </DivinationProvider>
  );
}
