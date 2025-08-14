import { Box, Typography, Link, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { DayNightToggle } from './components/day-night-toggle';
import { useThemeStore } from './providers/theme';
import { MainContent } from './pages/main-content';
import { useRef, useState } from 'react';
import { DraggableSidebar } from './components/sidebar';
import { GlobalSnackbar } from './components/snackbar';
import { DecodeList } from './pages/decode-list';
import { useSidebarStore } from './providers/sidebar';

function App() {
  const themeMode = useThemeStore((state) => state.mode);
  const toggleThemeMode = useThemeStore((state) => state.toggleTheme);
  const palette = useThemeStore((state) => state.palette);

  const dayNightToggleRef = useRef<HTMLElement>(null);

  const sidebarState = useSidebarStore();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: palette.Background,
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          left: 10,
          bottom: 10,
          zIndex: 102, // zIndex of DraggableSidebar is 100 & 101
          backgroundColor: palette.SecondaryBackground,
          padding: 0.8,
          borderRadius: '50% / 100%',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}
        ref={dayNightToggleRef}
      >
        <DayNightToggle value={themeMode} size={1.5} onChange={toggleThemeMode} />
      </Box>

      <DraggableSidebar
        hideFullscreenExcludes={[dayNightToggleRef]}
        minWidth={300}
        show={sidebarState.show}
        setShow={sidebarState.setShow}
      >
        <DecodeList />
      </DraggableSidebar>

      <GlobalSnackbar />

      <Typography variant="h4" sx={{ textAlign: 'center', marginTop: 4, fontWeight: 'bold' }}>
        光棱坦克工厂
      </Typography>
      <TopLinks />
      <MainContent />
      <VersionInfo />
      <BottomLinks />
      <ChangeHistory />
    </Box>
  );
}

function TopLinks() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        color: 'text.secondary',
      }}
    >
      <Typography variant="body2">
        <Link href="https://example.com" target="_blank" rel="noopener">
          什么是光棱坦克
        </Link>
      </Typography>

      <Typography variant="body2">本网站仅做辅助, 并非此类坦克的唯一解!</Typography>

      <Typography variant="body2">
        推荐访问方式:&nbsp;
        <Link href="https://example.com" target="_blank" rel="noopener">
          https://prism.uyanide.com
        </Link>
      </Typography>

      <Box sx={{ margin: 0.5 }} />
      <Typography variant="body2">
        <Link href="https://example.com" target="_blank" rel="noopener">
          下载当前页面
        </Link>
      </Typography>
      <Typography variant="body2">可在任意支持 HTML5 的浏览器中离线使用</Typography>
    </Box>
  );
}

function VersionInfo() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Typography variant="body1">
        当前版本: <strong>1.6.0</strong>
      </Typography>
      <Typography variant="body2">如发现有功能不正常可手动清理浏览器缓存后刷新</Typography>
    </Box>
  );
}

function BottomLinks() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        color: 'text.secondary',
      }}
    >
      <Typography variant="body2">更多其他项目</Typography>
      <Typography variant="body2">
        <Link href="https://example.com" target="_blank" rel="noopener">
          幻光火箭炮工厂 (暂定)
        </Link>
      </Typography>
      <Typography variant="body2">
        <Link href="https://example.com" target="_blank" rel="noopener">
          全彩幻影坦克工厂
        </Link>
      </Typography>
      <Box margin={0.5} />
      <Typography variant="body2">
        <Link href="https://example.com" target="_blank" rel="noopener">
          Bug 或建议反馈
        </Link>
      </Typography>
      <Typography variant="body2">
        <Link href="https://example.com" target="_blank" rel="noopener">
          Github - Uyanide (我)
        </Link>
      </Typography>
      <Typography variant="body2">
        <Link href="https://example.com" target="_blank" rel="noopener">
          Github - Mirage_Decode (本项目仓库)
        </Link>
      </Typography>
    </Box>
  );
}

function ChangeHistory() {
  const [fold, setFold] = useState(true);
  const palette = useThemeStore((state) => state.palette);

  const versionData = [
    {
      version: '1.0',
      changes: ['实施版本号记录，用于优化缓存处理', '添加从剪贴板粘贴图片功能', '在显形界面添加"保存原始图像"功能'],
    },
    {
      version: '1.1',
      changes: ['可以根据系统设置进行明暗主题切换', '添加"表图是否取灰度"功能'],
    },
    {
      version: '1.2',
      changes: [
        '引入jpeg-js库部分源码，统一不同浏览器编码jpeg时的行为',
        '引入piexif库部分源码，用于读取jpeg图片的元数据',
        '支持jpeg图片在生成时写入参数以在显形时自动填写',
      ],
    },
    {
      version: '1.3',
      changes: [
        '引入png-metadata库部分源码，用于读取png图片的元数据',
        '支持png图片在生成时写入参数以自动显形',
        '添加表里图对比度调整功能',
        '里图对比度可写入元数据',
      ],
    },
    {
      version: '1.4',
      changes: [
        '针对特定浏览器优化',
        '支持幻影坦克作为表图',
        '添加手动切换明暗主题功能，方便观察幻影坦克',
        '优化Alpha通道处理逻辑，为可能的幻影坦克整合铺路',
        '添加显形界面阈值直接输入的功能',
        '显形界面支持多文件输入，为方便查看增加侧边栏',
        '支持html文档下载以供离线使用',
      ],
    },
    {
      version: '1.5',
      changes: ['使用cors代理，希望能解决跨域问题', '修复若干历史遗留 Bug'],
    },
    {
      version: '1.6',
      changes: ['使用 React 重写整个项目'],
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        color: 'text.secondary',
      }}
    >
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setFold(!fold);
        }}
        sx={{
          fontSize: 'small',
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {fold ? '显示主要更新记录' : '隐藏更新记录'}
      </Link>

      {!fold && (
        <Box
          sx={{
            width: '100%',
            maxWidth: 600,
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: palette.SecondaryBackground,
              borderRadius: 4,
              padding: 2,
            }}
          >
            <Table size="small">
              <TableBody>
                {versionData.map((item) => (
                  <TableRow key={item.version}>
                    <TableCell
                      sx={{
                        fontSize: 'small',
                        fontWeight: 'bold',
                        verticalAlign: 'top',
                      }}
                    >
                      {item.version}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: 'small',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.changes.map((change, index) => (
                        <Typography
                          key={change}
                          variant="body2"
                          component="div"
                          sx={{ marginBottom: index < item.changes.length - 1 ? 0.5 : 0 }}
                        >
                          {change}
                          {index < item.changes.length - 1 && (
                            <>
                              ;<br />
                            </>
                          )}
                        </Typography>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

export default App;
