import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getBooksData, getInfoData, startGetBook } from './cheerio/index.js';
import { readFile } from "fs/promises"; // 引入fs/promises库用于异步文件操作
import { existsSync } from "fs";
// 引入 path 模块
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import schedule from 'node-schedule'; // 引入 node-schedule

// 处理 ES 模块中的 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 4321;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 获取所有类型数据的接口
app.post('/getAllTypes', async (req, res) => {
  try {
    // 构建指向 cheerio 文件夹下 typesArr.json 的路径
    const typesListPath = path.join(__dirname, 'cheerio', 'typesArr.json');
    if (existsSync(typesListPath)) {
      const fileContent = await readFile(typesListPath, "utf8");
      const allTypes = JSON.parse(fileContent);
      res.json(allTypes);
    } else {
      res.status(404).json({ message: '未找到类型数据' });
    }
  } catch (error) {
    res.status(500).json({ message: '获取类型数据失败', error: error.message });
  }
});

// 获取所有小说数据的接口，改为 POST 请求并添加分页和筛选功能
app.post('/getAllBooks', async (req, res) => {
  try {
    // 从请求体中获取 page、pageSize、sortid 和 searchValue 参数，若未提供则使用默认值
    const { page = 1, pageSize = 10, sortid, searchValue } = req.body;
    // 构建指向 cheerio 文件夹下 novelsList.json 的路径
    const novelsListPath = path.join(__dirname, 'cheerio', 'novelsList.json');
    if (existsSync(novelsListPath)) {
      const fileContent = await readFile(novelsListPath, "utf8");
      const allNovels = JSON.parse(fileContent);

      // 根据 sortid 筛选数据
      let filteredNovels = allNovels;
      if (sortid !== undefined) {
        filteredNovels = allNovels.filter(novel => novel.sortid === sortid);
      }

      // 根据 searchValue 进行搜索
      if (searchValue) {
        const lowerCaseSearchValue = searchValue.toLowerCase();
        filteredNovels = filteredNovels.filter(novel => {
          const articleName = novel.articlename?.toLowerCase() || '';
          const author = novel.author?.toLowerCase() || '';
          const intro = novel.intro?.toLowerCase() || '';
          return articleName.includes(lowerCaseSearchValue) || author.includes(lowerCaseSearchValue) || intro.includes(lowerCaseSearchValue);
        });
      }

      // 计算分页的起始索引和结束索引
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      // 进行分页截取
      const paginatedNovels = filteredNovels.slice(startIndex, endIndex);
      // 构建分页响应数据
      const responseData = {
        total: filteredNovels.length,
        page,
        pageSize,
        data: paginatedNovels
      };
      res.json(responseData);
    } else {
      res.status(404).json({ message: '未找到小说数据' });
    }
  } catch (error) {
    res.status(500).json({ message: '获取小说数据失败', error: error.message });
  }
});

// 获取书籍章节等信息的接口，改为 POST 请求
app.post('/getBooksData', async (req, res) => {
  const { bookUrl } = req.body;
  if (!bookUrl) {
    return res.status(400).json({ message: '缺少 bookUrl 参数' });
  }
  try {
    const bookData = await getBooksData(bookUrl);
    res.json(bookData);
  } catch (error) {
    res.status(500).json({ message: '获取书籍数据失败', error: error.message });
  }
});

// 获取书籍每章节数据的接口，改为 POST 请求
app.post('/getInfoData', async (req, res) => {
  const { infoUrl } = req.body;
  if (!infoUrl) {
    return res.status(400).json({ message: '缺少 infoUrl 参数' });
  }
  try {
    const infoData = await getInfoData(infoUrl);
    res.json(infoData);
  } catch (error) {
    res.status(500).json({ message: '获取章节数据失败', error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);

  // 设置每天凌晨 0 点执行一次定时任务
  const job = schedule.scheduleJob('0 0 * * *', async () => {
    try {
      console.log('开始执行定时任务...');
      await startGetBook();
      console.log('定时任务执行完成');
    } catch (error) {
      console.error('定时任务执行出错:', error);
    }
  });
});