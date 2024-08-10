<small> 第一次写前端…… </small>

# 基于色阶分离与像素交错的隐写图显形与制作工具

## 链接 (已使用Cloudflare全面代理)
[光棱坦克工厂](https://prism.uyanide.com/)

## 使用方法
一看就懂，不懂也能用 :)

## 技术原理及思路来源
[Uyanide/Mirage_Image](https://github.com/Uyanide/Mirage_Image)

## 引用库
- **[jpeg-js](https://github.com/jpeg-js/jpeg-js)** (用于统一不同浏览器编码JPEG的行为)
- **[piexifjs](https://github.com/hMatoba/piexifjs)** (用于读写JPEG Metadata)
- **[node-png-metadata](https://github.com/kujirahand/node-png-metadata)** (用于读写PNG Chunk)

## 项目结构
- **docs** (部署目录)
  - **css**
    - **style.css**
    - **switch.css**
  - **res**
    - **neko.ico** (图标)
    - **default.png** (默认显形源)
    - **buta.jpg** (默认表图)
    - **neko.jpg** (默认里图)
  - **src**
    - **main.js**
    - **main.js.LICENSE.txt**
  - **CNAME**
  - **DefaultArguments.json**
  - **index.html**

- **scripts** (原始脚本)
  - **lib** (第三方库)
    - **[encoder.js](https://github.com/jpeg-js/jpeg-js/blob/master/lib/encoder.js)**
    - **[piexif.js](https://github.com/hMatoba/piexifjs/blob/master/piexif.js)**
    - **[png-metadata.js](https://github.com/kujirahand/node-png-metadata/blob/master/src/lib/png-metadata.js)**
  - **listeners** (事件监听、回调与辅助函数)
    - **DecodeListeners.js**
    - **EncodeListeners.js**
    - **ImageLoader.js**
    - **UniversalListeners.js**
  - **prismProcessor** (图像处理)
    - **PrismDecoder.js**
    - **PrismEncoder.js**
  - **DefaultArguments.js** (加载默认参数)
  - **init.js** (初始化)

# Q&A

### 1. 这个什么所谓光棱坦克只能用这个工具看吗？
并不是，通过图像编辑软件调整某些参数也可以看到被藏的图片，详情参见[百度贴吧 - 开个贴细说新式高科技坦克](https://tieba.baidu.com/p/9093709508)。

### 2. 这个什么所谓光棱坦克只能用这个工具做吗？
并不是，完全可以仅使用ps等图像编辑软件制作，详情参见同上。

### 3. 无论怎么拉参数都完全看不出里图怎么办？
请再次确认保存的是原图。如果使用的是百度贴吧手机app，请按以下步骤逐一排查：

1. 请确认在保存图片前长按图片选择“查看原图”并等待加载完成，然后再保存图片。
2. 如果仍然无效，可以复制帖子链接在浏览器里重新打开，下载或复制图片。
3. 如果仍然无效，🔨

如果使用的是百度贴吧电脑网页端，请确认在保存、复制或拖动图片前已点击图片，跳转至新的大图页面，等待完全加载完成后再进行操作。

如果你是图片的制作者，请按以下步骤逐一排查：

1. 请确认参数设置是否合理，例如里图色阶端点设置是否过低，对比度设置是否过于夸张。
2. 可尝试更换导出格式，有关PNG/JPEG的格式的区别详见Q&A第6条。
3. 请确认在发送图片时勾选了“原图”选项。
4. 如果使用的是百度贴吧，请确认在设置中关闭了图片水印。如果有水印百度会对图片进行二次处理，可能会产生意料之外的图片压缩。

### 4. 为何从URL加载图像一直无效？明明复制到浏览器地址栏可以正常访问？
恕我才疏学浅，目前仍未找到完美解决跨源访问问题的方案，某些URL也因此无法正常加载。如果有方便使用且大陆用户可正常访问的CORS代理服务或者其他任何解决方案欢迎指教。

### 5. 图像为何保存失败？
可以更换浏览器重试。另外如果可以的话请告诉我你使用的浏览器，我在验证后会将其列为特例以使用另一种图像保存方案。目前确认无法通过常规方法正常保存图片的浏览器有且仅有小米系统默认内置浏览器。

更新：已确认安卓端UC浏览器与夸克浏览器中保存功能也存在异常，并且上述备用方案也不起作用。那只能建议更换浏览器了，或者有其他任何解决方案也欢迎指教。

### 6. 保存为PNG格式和JPEG格式有何区别？

1. JPEG格式为有损压缩，即便目前已经通过引入第三方库保证了较高的图像保存质量，仍然会不可避免地在显形时出现噪点等其他问题。
2. PNG格式虽然可以保证较高的显形质量，但却极易被社交平台强制压缩，影响传输后的图像质量。且写入tEXt块的显形参数很容易被忽略造成自动显形功能失效。
3. JPEG格式不支持透明度，因此当表图或里图为幻影坦克时不建议使用JPEG格式导出。

### 7. 为什么有些图片可以自动调整参数，自动显形，有些却不行？
本工具的自动显形是通过写入图片元数据实现的，如果图片本身不具备元数据/传输过程中丢失元数据便无法做到自动显形。1.3版本后制作图片时均会自动写入生成所用的参数。