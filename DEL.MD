

## CCTextureCache

cc.loadImg, cc.loadImage.handler, cc.computeImageFormatType,
addImageAsync,



## SimpleAudioEngine

疑问：willPlayMusic

preloadMusic, preloadEffect, isFormatSupported, cc.SimpleSFX, preloadSound, _musicListener,


cc.AudioEngine.end 移到了实例中



## CCFileUtils
purgeCachedEntries, unloadBinaryFileData, preloadBinaryFileData,


cc.LabelBMFont.purgeCachedData
cc.FNTConfigRemoveCache
cc.BMFontConfiguration


## BMF
//TODO cc.doCallback

## CCTGAlib.js
cc.tgaLoad


        "core" : [
            "cocos2d/core/platform/CCClass.js",
            "cocos2d/core/CCLoaders.js",
            "cocos2d/core/cocoa/CCGeometry.js",
            "cocos2d/core/platform/Sys.js",
            "cocos2d/core/platform/CCConfig.js",
            "cocos2d/core/platform/miniFramework.js",
            "cocos2d/core/platform/CCCommon.js",
            "cocos2d/core/platform/CCMacro.js",
            "cocos2d/core/platform/CCTypes.js",
            "cocos2d/core/platform/CCEGLView.js",
            "cocos2d/core/platform/CCScreen.js",
            "cocos2d/core/platform/CCVisibleRect.js",
            "cocos2d/core/platform/CCInputManager.js",
            "cocos2d/core/cocoa/CCAffineTransform.js",
            "cocos2d/core/support/CCPointExtension.js",
            "cocos2d/core/support/CCVertex.js",
            "cocos2d/core/support/TransformUtils.js",
            "cocos2d/event_dispatcher/CCTouch.js",
            "cocos2d/event_dispatcher/CCEvent.js",
            "cocos2d/event_dispatcher/CCEventListener.js",
            "cocos2d/event_dispatcher/CCEventManager.js",
            "cocos2d/core/base_nodes/CCNode.js",
            "cocos2d/core/base_nodes/CCAtlasNode.js",
            "cocos2d/core/textures/CCTexture2D.js",
            "cocos2d/core/textures/CCTextureCache.js",
            "cocos2d/core/textures/CCTextureAtlas.js",
            "cocos2d/core/scenes_nodes/CCScene.js",
            "cocos2d/core/scenes_nodes/CCLoaderScene.js",
            "cocos2d/core/layers_nodes/CCLayer.js",
            "cocos2d/core/sprite_nodes/CCSprite.js",
            "cocos2d/core/sprite_nodes/CCAnimation.js",
            "cocos2d/core/sprite_nodes/CCAnimationCache.js",
            "cocos2d/core/sprite_nodes/CCSpriteFrame.js",
            "cocos2d/core/sprite_nodes/CCSpriteFrameCache.js",
            "cocos2d/core/sprite_nodes/CCSpriteBatchNode.js",
            "cocos2d/core/CCConfiguration.js",
            "cocos2d/core/CCDirector.js",
            "cocos2d/core/CCCamera.js",
            "cocos2d/core/CCScheduler.js",
            "cocos2d/core/CCDrawingPrimitives.js",
            "cocos2d/core/platform/CCSAXParser.js",
            "cocos2d/core/labelTTF/CCLabelTTF.js",
            "cocos2d/core/CCActionManager.js",
            "cocos2d/kazmath/utility.js",
            "cocos2d/kazmath/vec2.js",
            "cocos2d/kazmath/vec3.js",
            "cocos2d/kazmath/vec4.js",
            "cocos2d/kazmath/ray2.js",
            "cocos2d/kazmath/mat3.js",
            "cocos2d/kazmath/mat4.js",
            "cocos2d/kazmath/plane.js",
            "cocos2d/kazmath/quaternion.js",
            "cocos2d/kazmath/aabb.js",
            "cocos2d/kazmath/GL/mat4stack.js",
            "cocos2d/kazmath/GL/matrix.js",
            "cocos2d/shaders/CCShaders.js",
            "cocos2d/shaders/CCShaderCache.js",
            "cocos2d/shaders/CCGLProgram.js",
            "cocos2d/shaders/CCGLStateCache.js",
            "cocos2d/render_texture/CCRenderTexture.js",
            "cocos2d/motion_streak/CCMotionStreak.js",
            "cocos2d/clipping_nodes/CCClippingNode.js",
            "cocos2d/effects/CCGrid.js",
            "cocos2d/effects/CCGrabber.js",
            "cocos2d/shape_nodes/CCDrawNode.js",
            "cocos2d/actions/CCAction.js",
            "cocos2d/actions/CCActionInterval.js",
            "cocos2d/actions/CCActionInstant.js",
            "cocos2d/actions/CCActionCamera.js",
            "cocos2d/actions/CCActionEase.js",
            "cocos2d/actions/CCActionCatmullRom.js",
            "cocos2d/actions/CCActionTween.js",
            "cocos2d/actions3d/CCActionGrid.js",
            "cocos2d/actions3d/CCActionGrid3D.js",
            "cocos2d/actions3d/CCActionTiledGrid.js",
            "cocos2d/actions3d/CCActionPageTurn3D.js",
            "cocos2d/progress_timer/CCProgressTimer.js",
            "cocos2d/progress_timer/CCActionProgressTimer.js",
            "cocos2d/transitions_nodes/CCTransition.js",
            "cocos2d/transitions_nodes/CCTransitionProgress.js",
            "cocos2d/transitions_nodes/CCTransitionPageTurn.js",
            "cocos2d/label_nodes/CCLabelAtlas.js",
            "cocos2d/label_nodes/CCLabelBMFont.js",
            "cocos2d/compress/ZipUtils.js",
            "cocos2d/compress/base64.js",
            "cocos2d/compress/gzip.js",
            "cocos2d/compress/zlib.min.js",
            "cocos2d/particle_nodes/CCPNGReader.js",
            "cocos2d/particle_nodes/CCTIFFReader.js",
            "cocos2d/particle_nodes/CCParticleSystem.js",
            "cocos2d/particle_nodes/CCParticleExamples.js",
            "cocos2d/particle_nodes/CCParticleBatchNode.js",
            "cocos2d/keyboard_dispatcher/CCKeyboardDelegate.js",
            "cocos2d/keyboard_dispatcher/CCKeyboardDispatcher.js",
            "cocos2d/accelerometer/CCAccelerometer.js",
            "cocos2d/text_input_node/CCIMEDispatcher.js",
            "cocos2d/text_input_node/CCTextFieldTTF.js",
            "cocos2d/menu_nodes/CCMenuItem.js",
            "cocos2d/menu_nodes/CCMenu.js",
            "cocos2d/tileMap_nodes/CCTGAlib.js",
            "cocos2d/tileMap_nodes/CCTMXTiledMap.js",
            "cocos2d/tileMap_nodes/CCTMXXMLParser.js",
            "cocos2d/tileMap_nodes/CCTMXObjectGroup.js",
            "cocos2d/tileMap_nodes/CCTMXLayer.js",
            "cocos2d/parallax_nodes/CCParallaxNode.js",
            "cocos2d/audio/CCAudio.js",

            "cocos2d/CCUserDefault.js",
            "cocos2d/CCImage.js"
        ],