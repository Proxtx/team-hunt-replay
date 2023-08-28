import fs from "fs/promises";

export const getFiles = async () => {
  let res = await fs.readdir("history");
  res.sort((a, b) => Number(a.split(".")[0]) - Number(b.split(".")[0]));
  return res;
};

export const readFile = async (file) => {
  return JSON.parse(await fs.readFile("history/" + file, "utf8"));
};

export const getOutputFiles = async () => {
  let res = await fs.readdir("output");
  res.sort((a, b) => Number(a.split(".")[0]) - Number(b.split(".")[0]));
  return res;
};
