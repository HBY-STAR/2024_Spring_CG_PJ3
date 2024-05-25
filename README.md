# 2024 Spring CG PJ3

> 21302010042 
> 侯斌洋

---

## 1. 开发及运行环境

* 开发环境：`Windows 10`
* 开发工具：`WebStorm`
* 运行环境：`Wampserver64` + `Chrome`

## 2. 使用说明

1. 本地运行 `Wampserver64`
2. 将项目文件夹（`2024_Spring_CG_PJ3`）放置在 `www` 目录下
3. 浏览器停用缓存
4. 在浏览器中打开 http://localhost/2024_Spring_CG_PJ3/3DWalker.html

## 3. 功能点

### 3.1 基础功能点

- [x] 校准相机姿态
- [x] 变换投影方式
- [x] 添加 3D 复杂模型
- [x] 绘制 3D 渐变色箱体
- [x] 实现相机前后移动
- [x] 实现相机以 x 轴为轴上下旋转
- [x] 更改环境光和平行光光照值
- [x] 添加一个跟随相机移动的点光源
- [x] 实现一个简单的动画
- [x] 正确更换箱体和地面纹理
- [x] 运行时无明显卡顿

### 3.2 附加功能点

- [x] 实现雾化效果
- [x] 实现 phong shading
- [ ] 实现阴影效果

### 3.3 关于附加功能点

* 按 `R` 键可以实时添加或者去除雾化效果。（线性雾化）

* 在 `3DWalker.js` 中第三行可以开启 phong shading。默认为关闭状态，如下：

    ```js
    let usePhongShading = false;
    ```

* 阴影效果暂未实现。

## 4. 项目结构介绍

* `docs/`：文档目录
* `images/`：图片目录
* `libs/`：库目录
* `models/`：模型目录
* `3DWalker.html`：项目入口文件
* `3DWalker.js`：项目主要逻辑
* `Camera.js`：相机类
* `Cube.js`：加载渐变色箱体的类
* `Keyboard.js`：处理键盘事件类
* `Object.js`：加载复杂模型的类，使用默认光照模型
* `ObjectPhong.js`：加载复杂模型的类，使用 phong shading
* `scene.js`：存放场景配置
* `Texture.js`：加载带纹理模型的类
* `README.md`：项目说明文档

## 5. 项目中的亮点

* 尝试实现了雾化效果和 phong shading。
* 程序性能较好，无明显卡顿。

## 6. 开发过程中遇到的问题

* 浏览器缓存问题，导致有时修改代码后刷新页面无效，需要手动停用浏览器缓存。
* phong shading 实现花了不少功夫，主要是 shader 程序 bug 比较难找，需要来回查看代码逻辑。

## 7. 项目可能存在的问题

* 有些参数是在着色器中硬编码的，比如`DiffuseLight`、`shininessVal`等，因为在 `scene.js` 中并没有提供这些参数。
* 阴影效果暂未实现。



Repo: https://github.com/HBY-STAR/2024_Spring_CG_PJ3  ( private before 6.14 )
