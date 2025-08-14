import { useState, useEffect, useRef, useCallback, type RefObject, type ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { useThemeStore } from '../providers/theme';

interface SidebarProps {
  show: boolean;
  setShow: (show: boolean) => void;
  minWidth: number;
  children?: ReactNode;
  hideFullscreenExcludes?: RefObject<HTMLElement | null>[];
}

// isVisible === false ?
//      click on sidebarToggleButton => show sidebar
//      click on sidebar => show side bar
// isVisible === true ?
//      mouse down on sidebarToggleButton => start dragging
//          mouse moved => set hasDragged to true
//          mouse up => hasDragged === true? => do nothing
//                      hasDragged === false? => hide sidebar
//          ignore any other events
//      click on other elements except for sidebar && hideFullscreenExcludes => hide sidebar

export function DraggableSidebar({ minWidth, children = null, hideFullscreenExcludes, show, setShow }: SidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const hasDraggedRef = useRef(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarToggleButtonRef = useRef<HTMLDivElement>(null);

  const hideSidebar = useCallback(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.classList.remove('sidebarShow');
      sidebar.classList.add('sidebarHide');
    }
    setShow(false);
  }, [setShow]);

  const hideSidebarFullscreen = useCallback(
    (event: MouseEvent) => {
      if (!show) {
        return;
      }
      const target = event.target as HTMLElement;

      if (sidebarRef.current && sidebarRef.current.contains(target)) {
        return;
      }
      if (hideFullscreenExcludes) {
        for (const exclude of hideFullscreenExcludes) {
          if (exclude.current && exclude.current.contains(target)) {
            return;
          }
        }
      }
      hideSidebar();
    },
    [hideFullscreenExcludes, hideSidebar, show]
  );

  useEffect(() => {
    document.body.addEventListener('click', hideSidebarFullscreen);
    return () => {
      document.body.removeEventListener('click', hideSidebarFullscreen);
    };
  }, [hideSidebarFullscreen]);

  const showSidebar = useCallback(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.classList.remove('sidebarHide');
      sidebar.classList.add('sidebarShow');
    }
    setShow(true);
  }, [setShow]);

  const adjustSidebarWidth = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!show) {
        showSidebar();
        return;
      }

      disableHorizontalScroll();
      const initX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
      const parentWidth = document.documentElement.getBoundingClientRect().width;
      const maxWidth = parentWidth * 0.9;
      hasDraggedRef.current = false;

      const dragMouse = (e: MouseEvent) => {
        hasDraggedRef.current = true;
        const offset = e.clientX - initX;
        const newWidth = Math.min(Math.max(sidebarWidth - offset, minWidth), maxWidth);
        setSidebarWidth(newWidth);
      };

      const dragTouch = (e: TouchEvent) => {
        hasDraggedRef.current = true;
        const offset = e.touches[0].clientX - initX;
        const newWidth = Math.min(Math.max(sidebarWidth - offset, minWidth), maxWidth);
        setSidebarWidth(newWidth);
      };

      const dragEnd = () => {
        document.removeEventListener('mousemove', dragMouse);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragTouch);
        document.removeEventListener('touchend', dragEnd);
        enableHorizontalScroll();
        if (!hasDraggedRef.current) {
          hideSidebar();
        }
        hasDraggedRef.current = false;
      };

      document.addEventListener('mousemove', dragMouse);
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchmove', dragTouch);
      document.addEventListener('touchend', dragEnd);
    },
    [sidebarWidth, minWidth, hideSidebar, showSidebar, show]
  );

  const handleSidebarClick = () => {
    if (!show) {
      showSidebar();
    }
  };

  const palette = useThemeStore((state) => state.palette);

  return (
    <Box
      ref={sidebarRef}
      id="sidebar"
      onClick={handleSidebarClick}
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: `${sidebarWidth.toString()}px`,
        height: '100%',
        boxShadow: '-5px 0 10px rgba(0, 0, 0, 0.1)',
        padding: '30px',
        zIndex: 100,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: palette.SecondaryBackground,
        borderLeft: `5px solid ${palette.ElementBackground}`,
        transition: 'transform 0.5s, background-color 0.7s, border-color 0.7s !important',
        transform: show ? 'translateX(0) ' : `translateX(${(sidebarWidth - 30).toString()}px)`,
      }}
    >
      <Box
        ref={sidebarToggleButtonRef}
        id="sidebarToggleButton"
        onMouseDown={adjustSidebarWidth}
        onTouchStart={adjustSidebarWidth}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '0px',
          boxShadow: '-5px 0 10px rgba(0, 0, 0, 0.1)',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '40px',
          border: '0px solid',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 101,
          transition: 'background-color 0.7s, border-color 0.7s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.ElementBackground,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={'bold'}
          sx={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
        >
          &nbsp;≡
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

const disableHorizontalScroll = () => {
  document.documentElement.style.overflowX = 'hidden';
};

const enableHorizontalScroll = () => {
  document.documentElement.style.overflowX = 'auto';
};
