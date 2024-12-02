const { default: puppeteer } = require('puppeteer')
const fs = require('fs')

const productArray = []
const scrapper = async (url) => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  let pageNum = 1
  let hasMorePages = true

  while (hasMorePages) {
    const fullUrl = `${url}?page=${pageNum}`
    console.log(`Visiting: ${url}`)
    await page.goto(fullUrl)

    const productList = await page.$$('.sc-597dbd60-0')

    if (productList.length === 0) {
      console.log('no se encontro mas productos, fin del scraping')
      hasMorePages = false
    }

    for (const productDiv of productList) {
      try {
        let img = await productDiv.$eval('img', (el) => el.src)
        let price = await productDiv.$eval('.sc-e0c7d9f7-0 ', (el) => el.textContent)
        let cleanedPrice = price.replace(/[^\d,]/g, '')
        let integerPrice = parseInt(cleanedPrice, 10)
        let title = await productDiv.$eval('[data-test="product-title"]', (el) => el.textContent)

        const product = {
          img,
          integerPrice,
          title
        }
        productArray.push(product)
      } catch (error) {
        console.log('error al extraer un producto:', err.message)
      }
    }
    console.log(`pagina ${pageNum}: ${productArray.length} recolectados`)
    pageNum++
  }
  await browser.close()
  console.log(`${productArray.length} productor scrapeados`)
  console.log(productArray)
  write(productArray)
}
const write = (productArray) => {
  fs.writeFile('products.json', JSON.stringify(productArray, null, 2), (err) => {
    if (err) {
      console.error('Error al escribir el archivo:', err)
    } else {
      console.log('Archivo escrito correctamente')
    }
  })
}
scrapper('https://www.mediamarkt.es/es/category/port%C3%A1tiles-con-ia-1549.html')
