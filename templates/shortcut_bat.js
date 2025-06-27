export function generateInstallAndShortcutBat(mysqlHome = 'D:\\mysql-8.0.11-winx64', password = '123456') {
  const bin = `${mysqlHome}\\bin`;
  return `@ECHO OFF
setlocal EnableDelayedExpansion

REM MySQL 安装相关
set "MYSQL_HOME=${mysqlHome}"
set "MYSQL_PATH=${bin}"
set "MYSQL_ROOT_PASSWORD=${password}"
setx /m "path" "%MYSQL_PATH%;%path%"

%MYSQL_PATH%\\mysqld --initialize-insecure
%MYSQL_PATH%\\mysqld install mysql
net start mysql
%MYSQL_PATH%\\mysqladmin -u root password "%MYSQL_ROOT_PASSWORD%"
%MYSQL_PATH%\\mysql -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "CREATE USER 'root'@'%' IDENTIFIED BY '${password}';"
%MYSQL_PATH%\\mysql -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';"
%MYSQL_PATH%\\mysql -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "alter user root@'localhost' identified with mysql_native_password by '${password}';"
%MYSQL_PATH%\\mysql -uroot -p"%MYSQL_ROOT_PASSWORD%"

timeout /t 2 >nul

REM 快捷方式相关
set "SrcFile=%MYSQL_HOME%\\bin\\mysql.exe"
set "Args=-uroot -p"
set "LnkFile=%USERPROFILE%\\Desktop\\MySQL Command Line Client.lnk"
set "StartMenuLnkFile=%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\MySQL Command Line Client.lnk"
set "IconFile=%MYSQL_HOME%\\mysqlico.ico"

REM 创建桌面快捷方式
call :CreateShort "%SrcFile%" "%Args%" "%LnkFile%" "%IconFile%"

REM 创建开始菜单快捷方式
call :CreateShort "%SrcFile%" "%Args%" "%StartMenuLnkFile%" "%IconFile%"

goto :eof

:CreateShort
REM 参数：%1=目标程序 %2=参数 %3=快捷方式路径 %4=图标文件
set "VBSFile=%temp%\\createshortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBSFile%"
echo sLinkFile = WScript.Arguments(0) >> "%VBSFile%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBSFile%"
echo oLink.TargetPath = WScript.Arguments(1) >> "%VBSFile%"
echo oLink.Arguments = WScript.Arguments(2) >> "%VBSFile%"
echo oLink.IconLocation = WScript.Arguments(3) >> "%VBSFile%"
echo oLink.Save >> "%VBSFile%"
cscript //nologo "%VBSFile%" "%~3" "%~1" "%~2" "%~4"
del "%VBSFile%"
exit /b
`;
} 