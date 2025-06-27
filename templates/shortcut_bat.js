// 8.0/5.7 通用脚本模板
const batTemplate80_57 = (password) => `@echo off
chcp 65001
REM Set working directory to script location
cd /d %~dp0
REM Enable delayed variable expansion
setlocal enabledelayedexpansion
REM Log start
set "LOGFILE=%~dp0install_log.txt"
echo Script started at %date% %time% >> "%LOGFILE%"
REM Check if MySQL service exists
SC QUERY mysql > NUL
if %errorlevel% equ 0 (
	echo MySQL service already exists. >> "%LOGFILE%"
	echo MySQL service already exists.
	pause
	exit
)
REM Check if MySQL directory exists
if not exist "%cd%\\bin\\mysqld.exe" (
	echo MySQL bin directory or mysqld.exe not found! >> "%LOGFILE%"
	echo MySQL bin directory or mysqld.exe not found!
	pause
	exit
)
echo MySQL service not found, start install... >> "%LOGFILE%"
echo MySQL service not found, start install...
REM Set MYSQL_HOME and MYSQL_ROOT_PASSWORD
set "MYSQL_HOME=%cd%"
set "MYSQL_ROOT_PASSWORD=${password}"
REM Set system environment variable MYSQL_HOME
SETX /M "MYSQL_HOME" "%MYSQL_HOME%" >> "%LOGFILE%"
if %errorlevel% equ 0 (
	echo Set MYSQL_HOME success. >> "%LOGFILE%"
	echo Set MYSQL_HOME success.
) else (
	echo Set MYSQL_HOME failed. >> "%LOGFILE%"
	echo Set MYSQL_HOME failed.
	pause
	exit
)
REM Create desktop and start menu shortcuts
set "LnkFile=%USERPROFILE%\\Desktop\\MySQL Command Line Client.lnk"
set "StartMenuLnkFile=%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\MySQL Command Line Client.lnk"
set "IconFile=%MYSQL_HOME%\\mysqlico.ico"
set "SrcFile=%MYSQL_HOME%\\bin\\mysql.exe"
set "Args=-uroot -p"
call :CreateShort "%SrcFile%" "%Args%" "%LnkFile%" "%IconFile%"
call :CreateShort "%SrcFile%" "%Args%" "%StartMenuLnkFile%" "%IconFile%"
REM Initialize MySQL (no password)
echo Init MySQL database...
"%MYSQL_HOME%\\bin\\mysqld" --initialize-insecure
set INIT_ERR=%errorlevel%
echo Init MySQL return code: %INIT_ERR%
if %INIT_ERR% neq 0 (
	echo Init MySQL failed, code: %INIT_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Install MySQL service
echo Install MySQL service...
"%MYSQL_HOME%\\bin\\mysqld" install mysql
set INSTALL_ERR=%errorlevel%
echo Install MySQL service return code: %INSTALL_ERR%
if %INSTALL_ERR% neq 0 (
	echo Install MySQL service failed, code: %INSTALL_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Start MySQL service
echo Start MySQL service...
net start mysql
set START_ERR=%errorlevel%
echo Start MySQL service return code: %START_ERR%
if %START_ERR% neq 0 (
	echo Start MySQL service failed, code: %START_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Set root password
echo Set root password...
"%MYSQL_HOME%\\bin\\mysqladmin" -u root password "%MYSQL_ROOT_PASSWORD%"
set PASS_ERR=%errorlevel%
echo Set root password return code: %PASS_ERR%
if %PASS_ERR% neq 0 (
	echo Set root password failed, code: %PASS_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Create remote root user
echo Create remote root user...
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "CREATE USER 'root'@'%' IDENTIFIED BY '${password}';"
set CREATEUSER_ERR=%errorlevel%
echo Create remote root user return code: %CREATEUSER_ERR%
if %CREATEUSER_ERR% neq 0 (
	echo Create remote root user failed, code: %CREATEUSER_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Grant privileges to remote root user
echo Grant privileges to remote root user...
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';"
set GRANT_ERR=%errorlevel%
echo Grant privileges return code: %GRANT_ERR%
if %GRANT_ERR% neq 0 (
	echo Grant privileges failed, code: %GRANT_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Change local root password to mysql_native_password
echo Change local root password to mysql_native_password...
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "alter user root@'localhost' identified with mysql_native_password by '${password}';"
set ALTER_ERR=%errorlevel%
echo Change local root password return code: %ALTER_ERR%
if %ALTER_ERR% neq 0 (
	echo Change local root password failed, code: %ALTER_ERR% >> "%LOGFILE%"
	pause
	exit
)
echo MySQL install and config finished. >> "%LOGFILE%"
echo MySQL install and config finished.
echo.
echo =============================================
echo MySQL installation and configuration complete!
echo You can now use MySQL.
echo Please close this window manually when you are done.
echo =============================================
echo.
pause >nul
goto :eof
:CreateShort
REM %1=target exe, %2=args, %3=lnk path, %4=icon
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
pause
`;

// 5.5/5.6 通用脚本模板（内容可根据实际5.5/5.6需求调整）
const batTemplate55_56 = (password) => `@echo off
chcp 65001
REM Set working directory to script location
cd /d %~dp0
REM Enable delayed variable expansion
setlocal enabledelayedexpansion
REM Log start
set "LOGFILE=%~dp0install_log.txt"
echo Script started at %date% %time% >> "%LOGFILE%"
REM Check if MySQL service exists
SC QUERY mysql > NUL
if %errorlevel% equ 0 (
	echo MySQL service already exists. >> "%LOGFILE%"
	echo MySQL service already exists.
	pause
	exit
)
REM Check if MySQL directory exists
if not exist "%cd%\\bin\\mysqld.exe" (
	echo MySQL bin directory or mysqld.exe not found! >> "%LOGFILE%"
	echo MySQL bin directory or mysqld.exe not found!
	pause
	exit
)
echo MySQL service not found, start install... >> "%LOGFILE%"
echo MySQL service not found, start install...
REM Set MYSQL_HOME and MYSQL_ROOT_PASSWORD
set "MYSQL_HOME=%cd%"
set "MYSQL_ROOT_PASSWORD=${password}"
REM Set system environment variable MYSQL_HOME
SETX /M "MYSQL_HOME" "%MYSQL_HOME%" >> "%LOGFILE%"
if %errorlevel% equ 0 (
	echo Set MYSQL_HOME success. >> "%LOGFILE%"
	echo Set MYSQL_HOME success.
) else (
	echo Set MYSQL_HOME failed. >> "%LOGFILE%"
	echo Set MYSQL_HOME failed.
	pause
	exit
)
REM Create desktop and start menu shortcuts
set "LnkFile=%USERPROFILE%\\Desktop\\MySQL Command Line Client.lnk"
set "StartMenuLnkFile=%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\MySQL Command Line Client.lnk"
set "IconFile=%MYSQL_HOME%\\mysqlico.ico"
set "SrcFile=%MYSQL_HOME%\\bin\\mysql.exe"
set "Args=-uroot -p"
call :CreateShort "%SrcFile%" "%Args%" "%LnkFile%" "%IconFile%"
call :CreateShort "%SrcFile%" "%Args%" "%StartMenuLnkFile%" "%IconFile%"
REM Install MySQL service
echo Install MySQL service...
"%MYSQL_HOME%\\bin\\mysqld" install mysql
set INSTALL_ERR=%errorlevel%
echo Install MySQL service return code: %INSTALL_ERR%
if %INSTALL_ERR% neq 0 (
	echo Install MySQL service failed, code: %INSTALL_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Start MySQL service
echo Start MySQL service...
net start mysql
set START_ERR=%errorlevel%
echo Start MySQL service return code: %START_ERR%
if %START_ERR% neq 0 (
	echo Start MySQL service failed, code: %START_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Set root password
echo Set root password...
"%MYSQL_HOME%\\bin\\mysqladmin" -u root password "%MYSQL_ROOT_PASSWORD%"
set PASS_ERR=%errorlevel%
echo Set root password return code: %PASS_ERR%
if %PASS_ERR% neq 0 (
	echo Set root password failed, code: %PASS_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Create remote root user
echo Create remote root user...
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "CREATE USER 'root'@'%' IDENTIFIED BY '${password}';"
set CREATEUSER_ERR=%errorlevel%
echo Create remote root user return code: %CREATEUSER_ERR%
if %CREATEUSER_ERR% neq 0 (
	echo Create remote root user failed, code: %CREATEUSER_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Grant privileges to remote root user
echo Grant privileges to remote root user...
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';"
set GRANT_ERR=%errorlevel%
echo Grant privileges return code: %GRANT_ERR%
if %GRANT_ERR% neq 0 (
	echo Grant privileges failed, code: %GRANT_ERR% >> "%LOGFILE%"
	pause
	exit
)
REM Change local root password to mysql_native_password
echo Change local root password to mysql_native_password...
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "FLUSH PRIVILEGES; SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${password}');"
set ALTER_ERR=%errorlevel%
echo Change local root password return code: %ALTER_ERR%
if %ALTER_ERR% neq 0 (
	echo Change local root password failed, code: %ALTER_ERR% >> "%LOGFILE%"
	pause
	exit
)
echo MySQL install and config finished. >> "%LOGFILE%"
echo MySQL install and config finished.
echo.
echo =============================================
echo MySQL installation and configuration complete!
echo You can now use MySQL.
echo Please close this window manually when you are done.
echo =============================================
echo.
pause >nul
goto :eof
:CreateShort
REM %1=target exe, %2=args, %3=lnk path, %4=icon
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
pause
`;

// 主函数，按主版本号前两位选择模板
export function generateInstallAndShortcutBat(password = '123456', version = '8.0') {
	// 只取主版本号前两位
	let mainVer = '8.0';
	const m = version.match(/(\d+\.\d+)/);
	if (m) mainVer = m[1];
	if (mainVer === '8.0' || mainVer === '5.7') {
		return batTemplate80_57(password);
	} else if (mainVer === '5.5' || mainVer === '5.6') {
		return batTemplate55_56(password);
	} else {
		// 默认用8.0/5.7模板
		return batTemplate80_57(password);
	}
} 