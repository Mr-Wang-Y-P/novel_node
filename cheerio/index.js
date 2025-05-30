/*
 * @Author: 汪迎平
 * @Date: 2025-05-28 11:01:35
 * @LastEditTime: 2025-05-30 11:45:39
 * @LastEditors: 汪迎平
 * @Description: 爬取数据
 */
import axios from "axios"; // 引入axios库用于发送HTTP请求
import * as cheerio from "cheerio"; // 引入cheerio库用于解析HTML
import { readFile, writeFile } from "fs/promises"; // 引入fs/promises库用于异步文件操作
import { existsSync } from "fs"; // 引入fs库检查文件是否存在

const url = "https://www.bi3i.cc"; // 要爬取的网页URL

const typesArr = [];
// const novelsArr = [];
// 爬取数据的函数
async function scrapeData() {
  try {
    // 发送GET请求获取网页内容
    const response = await axios.get(url);
    // 使用cheerio解析HTML内容
    const $ = cheerio.load(response.data);
    // console.log(response.data);
    // 提取需要的数据
    const data = [];
    $(".nav")
      .find("li a")
      .each((index, element) => {
        if (
          $(element).text().trim() === "首页" ||
          $(element).text().trim() === "排行榜"
        )
          return; // 跳过首页链接
        typesArr.push({
          name: $(element).text(),
          url: $(element).attr("href"),
        });
      });

    for (let i = 0; i < typesArr.length; i++) {
      const item = typesArr[i];
      item["sortid"] = item.name !== "完本" ? i + 1 : 0;
    }
    // 将数据保存到文件中
    await writeFile("typesArr.json", JSON.stringify(typesArr, null, 2));
    console.log("数据爬取完成");
  } catch (error) {
    console.error("爬取数据出错:", error);
  }
}

// 将图片 URL 转换为 Base64 格式
async function imageUrlToBase64(imageUrl) {
  if(!imageUrl){
    return "data:image/jpeg;base64,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";
  }
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    return `data:${response.headers["content-type"]};base64,${buffer.toString(
      "base64"
    )}`;
  } catch (error) {
    console.error("图片转换失败:", error);
    return "data:image/jpeg;base64,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";
  }
}

async function getNovelsByCategory(sortid, page) {
  try {
    const typeUrl = `${url}/json?sortid=${sortid}&page=${page}`;
    const response = await axios.get(typeUrl);
    const novelsData = response.data;

    // 遍历每本小说数据，将图片 URL 转换为 Base64
    for (const novel of novelsData) {
      // if (novel.url_img) {
      //   // novel.url_img = await imageUrlToBase64(novel.url_img);
      //   // novel.url_img = 
      // }
      novel["sortid"] = sortid;
    }

    return novelsData;
  } catch (error) {
    console.error("获取小说数据出错:", error);
  }
}

async function getAllNovelsArr() {
  const novelsListPath = "novelsList.json";
  let allNovels = [];
  for (let i = 0; i < typesArr.length; i++) {
    const item = typesArr[i];
    console.log(`正在获取分类：${item.name}`);
    const sortid = item.sortid;
    const currentCategoryNovels = [];

    for (let j = 1; j <= 40; j++) {
      // 假设每个分类获取40页数据
      const res = await getNovelsByCategory(sortid, j);
      console.log(`获取分类：${item.name} 第 ${j} 页数据, 共 ${res?.length} 条`);
      if (res && res?.length > 0) {
        currentCategoryNovels.push(...res);
        console.log(`已获取共 ${currentCategoryNovels.length} 条`);
      } else {
        break; // 如果没有数据了，跳出循环
      }
    }
    allNovels.push(...currentCategoryNovels);
    // if (currentCategoryNovels.length > 0) {
    //   let allNovels = [];
    //   if (existsSync(novelsListPath)) {
    //     const fileContent = await readFile(novelsListPath, "utf8");
    //     allNovels = JSON.parse(fileContent);
    //   }
    //   allNovels.push(...currentCategoryNovels);
    //   console.log(`已获取共 ${allNovels.length} 条`);
    //   await writeFile(novelsListPath, JSON.stringify(allNovels, null, 2));
    // }
  }
  // 将数据保存到文件中
  await writeFile('novelsList.json', JSON.stringify(allNovels, null, 2));
  console.log("数据读取完成，已保存到novelsList");
}

// 获取书籍章节等信息
async function getBooksData(bookUrl) {
  const bookLink = `${url}${bookUrl}`;
  try {
    // 发送GET请求获取网页内容
    const response = await axios.get(bookLink);
    // 使用cheerio解析HTML内容
    const $ = cheerio.load(response.data);
    // 提取需要的数据
    const book = {};
    const bookTitle = $(".book .info h1").text().trim();
    book.title = bookTitle;
    const $img = $(".book .info .cover img");
    const imgUrl = $img.attr("src");
  
    const $smallDiv = $(".book .info .small");

    // 提取作者信息
    book.author = $smallDiv
      .find("span")
      .eq(0)
      .text()
      .replace("作者：", "")
      .trim();
    // 提取状态信息
    book.status = $smallDiv
      .find("span")
      .eq(1)
      .text()
      .replace("状态：", "")
      .trim();
    // 提取更新日期信息
    book.updateDate = $smallDiv
      .find("span.last")
      .eq(0)
      .text()
      .replace("更新：", "")
      .trim();
    // 提取最新章节信息
    book.latestChapter = {
      title: $smallDiv.find("span.last").eq(1).find("a").text().trim(),
      url: `${$smallDiv.find("span.last").eq(1).find("a").attr("href")}`,
    };
    // 提取 shortDesc 和 extraDesc 信息
    const $dd = $('.book .info .intro dd');
    let shortDesc = $dd.contents().first().text().replace('简介：', '').trim();
    let extraDesc = $dd.find('span.noshow').text().trim();

     // 去掉推荐地址及其后面的内容
    const recommendIndex = extraDesc.indexOf('推荐地址：');
    if (recommendIndex !== -1) {
      extraDesc = extraDesc.slice(0, recommendIndex).trim();
    }

    book.shortDesc = shortDesc;
    book.extraDesc = extraDesc;

     // 提取所有章节信息
    const chapters = [];
    $('body .listmain dl dd:not(.more.pc_none) a').each((index, element) => {
      const $a = $(element);
      chapters.push({
        title: $a.text().trim(),
        url: `${$a.attr('href')}`
      });
    });
    book.chapters = chapters;
    book.cover = await imageUrlToBase64(imgUrl);
    return book;
  } catch (error) {
    console.error("数据出错:", error);
  }
}

// 获取书籍每章节数据
async function getInfoData(infoUrl) {
  const infoLink = `${url}${infoUrl}`;
  try {
    // 发送GET请求获取网页内容
    const response = await axios.get(infoLink);
    // 使用cheerio解析HTML内容
    const $ = cheerio.load(response.data);
    // 提取需要的数据
    const info = {};
    const $content = $(".book .content");
    info.title = $content.find("h1.wap_none").text().trim();
    let infoText = $content.find("div#chaptercontent").html()?.trim() || '';
    // 查找 "请收藏本站" 的位置
    const index = infoText.indexOf('请收藏本站');
    if (index !== -1) {
      // 若找到，则截取该位置之前的内容
      infoText = infoText.slice(0, index).trim();
    }

    info.content = infoText;

    return info;
  } catch (error) {
    console.error("数据出错:", error);
  }
}


async function startGetBook() { 
  await scrapeData();
  await getAllNovelsArr();
}


export {
    getBooksData,
    getInfoData,
    startGetBook
}
