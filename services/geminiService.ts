
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserStats, FullPlan, CarbType, ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for structured plan output
const planSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weeklySchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayName: { type: Type.STRING, description: "星期几 (例如：星期一)" },
          carbType: { type: Type.STRING, enum: [CarbType.High, CarbType.Medium, CarbType.Low], description: "碳水循环类型" },
          trainingFocus: { type: Type.STRING, description: "训练重点 (中文描述)" },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER, description: "蛋白质 (克)" },
              carbs: { type: Type.NUMBER, description: "碳水化合物 (克)" },
              fat: { type: Type.NUMBER, description: "脂肪 (克)" },
              calories: { type: Type.NUMBER, description: "总热量 (千卡)" },
            },
            required: ["protein", "carbs", "fat", "calories"]
          },
          meals: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-4个简单的中文食谱建议"
          },
          tips: { type: Type.STRING, description: "当日的具体中文建议" }
        },
        required: ["dayName", "carbType", "trainingFocus", "macros", "meals", "tips"]
      }
    },
    summary: { type: Type.STRING, description: "策略总结 (中文)" },
    advice: { type: Type.STRING, description: "总体建议 (中文)" }
  },
  required: ["weeklySchedule", "summary", "advice"]
};

export const generateCarbCyclingPlan = async (stats: UserStats): Promise<FullPlan> => {
  let preferencesText = "用户未指定特定日程，请根据训练科学自动安排。";
  
  if (stats.weeklyPreferences) {
    const prefList = Object.entries(stats.weeklyPreferences)
      .filter(([_, pref]) => pref !== '自动')
      .map(([day, pref]) => `- ${day}: 强制设为 ${pref}`)
      .join('\n');
    
    if (prefList.length > 0) {
      preferencesText = `用户强制制定了以下日程安排，**你必须严格遵守，不可更改**：\n${prefList}\n其余标记为“自动”的日子请根据你的专业判断安排。`;
    }
  }

  const prompt = `
    作为一名世界级的运动营养专家，请根据以下用户数据设计一个科学的碳循环（Carb Cycling）计划：
    
    用户数据：
    - 年龄: ${stats.age}
    - 性别: ${stats.gender}
    - 身高: ${stats.height}cm
    - 体重: ${stats.weight}kg
    - 体脂率: ${stats.bodyFat}%
    - 目标体脂率: ${stats.targetBodyFat}%
    - 达成周期: ${stats.targetWeeks}周
    - 活跃度: ${stats.activityLevel}
    - 每周训练天数: ${stats.trainingDays}天

    **日程偏好设置：**
    ${preferencesText}

    核心逻辑要求：
    1. 高碳日（${CarbType.High}）必须安排在最高强度的训练日（如腿部、背部大肌群力量训练）。
    2. 低碳日（${CarbType.Low}）安排在休息日或低强度有氧日。
    3. 中碳日（${CarbType.Medium}）安排在中等强度训练日。
    4. 确保蛋白质摄入充足（建议每公斤体重1.6g-2.2g）。
    5. 制造合理的热量缺口以达到减脂目标。
    
    **重要格式与语言要求：**
    1. **所有文本内容必须完全使用简体中文**（除了数字和计量单位）。
    2. JSON 的键名 (Keys) 保持英文 (如 weeklySchedule, macros, protein)。
    3. "dayName" 必须使用: "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"。
    4. "carbType" 必须严格使用以下值: "${CarbType.High}", "${CarbType.Medium}", "${CarbType.Low}"。
    5. 食谱和建议必须符合中国人的饮食习惯。

    请严格按照JSON格式返回。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as FullPlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const chatWithCoach = async (
  currentMessage: string, 
  history: ChatMessage[], 
  planContext?: string
): Promise<string> => {
  try {
    // 1. Construct System Instruction with Persona and Context
    let systemInstruction = `
      You are "Coach Carbon", an encouraging, professional, and scientific fitness coach. 
      Answer questions specifically about carb cycling, nutrition, and training adjustments. 
      Keep answers concise (under 150 words) unless complex explanation is needed. 
      Be motivating!
      **Always reply in Chinese (Simplified).**
    `;

    if (planContext) {
      systemInstruction += `\n\nHERE IS THE USER'S CURRENT PLAN CONTEXT. USE THIS TO GIVE SPECIFIC ADVICE:\n${planContext}`;
    }

    // 2. Format history for Gemini SDK
    // Keep the last 10 messages (5 turns) to maintain context without overloading tokens
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // 3. Initialize Chat
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: recentHistory
    });

    // 4. Send Message
    const response = await chat.sendMessage({ message: currentMessage });
    return response.text || "抱歉，我现在有点走神，请再问一次。";
    
  } catch (error) {
    console.error("Chat error:", error);
    return "连接教练失败，请检查网络设置。";
  }
};
