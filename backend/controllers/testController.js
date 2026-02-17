const OpenAI = require("openai");
const { successResponse, errorResponse } = require('../utils/response');

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY || "sk-dc8a231641d244c8839bcd15dcdd679e", // Warning: Hardcoded key in original code, should be env var
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

const hello = (req, res) => {
    return successResponse(res, null, '你好，API测试成功！');
};

const qwenVl = async (req, res) => {
    const { imageUrl, text } = req.body;
    if (!imageUrl || !text) {
        return errorResponse(res, '缺少 imageUrl 或 text 参数', 400);
    }
    try {
        const response = await openai.chat.completions.create({
            model: "qwen-vl-max",
            messages: [
                {
                    role: "user", content: [
                        { type: "image_url", image_url: { url: imageUrl } },
                        { type: "text", text: text }
                    ]
                }
            ]
        });
        return successResponse(res, response);
    } catch (err) {
        return errorResponse(res, err);
    }
};

module.exports = {
    hello,
    qwenVl
};
