
import { Product } from '../types';

export interface ParsedMenu {
  products: Product[];
  categories: string[];
}

export const parseCSV = async (file: File): Promise<ParsedMenu> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          reject(new Error("File is empty"));
          return;
        }

        const lines = text.split(/\r\n|\n/);
        const products: Product[] = [];
        const categoriesSet = new Set<string>();

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(',');

          if (cols.length < 4) continue; 

          const category = cols[0]?.trim() || "未分類";
          const name = cols[1]?.trim();
          const description = cols[2]?.trim() || "";
          const priceM = parseInt(cols[3]?.trim() || "0", 10);
          const priceL = cols[4]?.trim() ? parseInt(cols[4].trim(), 10) : 0;
          const image = cols[5]?.trim() || undefined;

          const hasHotStr = cols[6]?.trim().toLowerCase();
          const hasColdStr = cols[7]?.trim().toLowerCase();
          const hasHot = hasHotStr !== 'false' && hasHotStr !== 'no' && hasHotStr !== '0';
          const hasCold = hasColdStr !== 'false' && hasColdStr !== 'no' && hasColdStr !== '0';

          if (!name || (priceM === 0 && priceL === 0)) continue;

          categoriesSet.add(category);

          products.push({
            id: `csv-${i}`,
            category,
            name,
            description,
            priceM,
            priceL,
            image,
            hasHot,
            hasCold
          });
        }

        resolve({
          products,
          categories: Array.from(categoriesSet)
        });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};

export const getSampleCSVContent = () => {
  return `類別,飲品名稱,描述,中杯價格,大杯價格,圖片連結(選填),可做熱飲(選填True/False),可做冷飲(選填True/False)`;
};
