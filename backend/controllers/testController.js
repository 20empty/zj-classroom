const OpenAI = require("openai");
const Response = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const hello = (req, res) => {
    return Response.success(res, null, '你好，API测试成功！');
};

const qwenVl = asyncHandler(async (req, res) => {
    const { imageUrl, text } = req.body;
    if (!imageUrl || !text) {
        return Response.error(res, '缺少 imageUrl 或 text 参数', 400);
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
        return Response.error(res, 'DASHSCOPE_API_KEY 未配置', 500);
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });

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
    return Response.success(res, response);
});

module.exports = {
    hello,
    qwenVl
};
