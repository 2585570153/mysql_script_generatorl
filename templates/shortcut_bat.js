// 8.0/5.7 Universal script template
const batTemplate80_57 = (password) => `@echo off
chcp 65001
REM Set working directory to script location
cd /d %~dp0
REM Enable delayed variable expansion
setlocal enabledelayedexpansion
REM Log start
set "LOGFILE=%~dp0install_log.txt"
echo [INFO] Script started at %date% %time% >> "%LOGFILE%"
REM Check if MySQL service exists
echo [INFO] Checking if MySQL service exists... >> "%LOGFILE%"
SC QUERY mysql > NUL
if %errorlevel% equ 0 (
	echo [INFO] MySQL service already exists. >> "%LOGFILE%"
	echo MySQL service already exists.
	pause
	echo [ERROR] Script exited because MySQL service already exists. >> "%LOGFILE%"
	exit /b 1
) else (
	echo [INFO] MySQL service not found. >> "%LOGFILE%"
)
REM Check if MySQL directory exists
echo [INFO] Checking if mysqld.exe exists at %cd%\\bin\\mysqld.exe >> "%LOGFILE%"
if not exist "%cd%\\bin\\mysqld.exe" (
	echo [ERROR] MySQL bin directory or mysqld.exe not found! >> "%LOGFILE%"
	echo MySQL bin directory or mysqld.exe not found!
	pause
	echo [ERROR] Script exited due to missing mysqld.exe. >> "%LOGFILE%"
	exit /b 2
) else (
	echo [INFO] Found mysqld.exe. >> "%LOGFILE%"
)
echo [INFO] MySQL service not found, start install... >> "%LOGFILE%"
echo MySQL service not found, start install...
REM Set MYSQL_HOME and MYSQL_ROOT_PASSWORD
set "MYSQL_HOME=%cd%"
set "MYSQL_ROOT_PASSWORD=${password}"

REM Set system environment variable MYSQL_HOME
echo ************** Setting system environment variable MYSQL_HOME ***************
echo.
echo [INFO] Setting system environment variable MYSQL_HOME. >> "%LOGFILE%"
SETX /M "MYSQL_HOME" "%MYSQL_HOME%" >> "%LOGFILE%"
if %errorlevel% equ 0 (
	echo [INFO] Set MYSQL_HOME success. >> "%LOGFILE%"
	echo ************** Set system environment variable MYSQL_HOME success ***************
	echo.
) else (
	echo [ERROR] Set MYSQL_HOME failed. >> "%LOGFILE%"
	echo ************** Set system environment variable MYSQL_HOME failed ***************
	echo Set system environment variable MYSQL_HOME failed >> "%LOGFILE%"
	echo.
	pause
	echo [ERROR] Script exited due to SETX failure. >> "%LOGFILE%"
	exit /b 3
)

REM Add MySQL bin to system PATH (simplified approach)
echo ***************** Setting system environment variable PATH *****************
echo.
echo [INFO] Adding MySQL bin to system PATH. >> "%LOGFILE%"
REM Check if MySQL bin is already in PATH
echo %PATH% | find /i "%MYSQL_HOME%\\bin" >nul
if %errorlevel% equ 0 (
	echo [INFO] MySQL bin already in PATH. >> "%LOGFILE%"
	echo ***************** Set system environment variable PATH success *****************
	echo.
) else (
	echo [INFO] MySQL bin not in PATH, adding... >> "%LOGFILE%"
	REM Use registry method directly (no PowerShell dependency)
	reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path >nul 2>&1
	if !errorlevel! equ 0 (
		REM Get current PATH from registry
		for /f "tokens=2,*" %%a in ('reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path 2^>nul') do set "CURRENT_PATH=%%b"
		REM Add MySQL bin to PATH
		reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path /t REG_EXPAND_SZ /d "!CURRENT_PATH!;%MYSQL_HOME%\\bin" /f >nul 2>&1
		set REG_ERR=!errorlevel!
		echo [DEBUG] Registry method exit code: !REG_ERR! >> "%LOGFILE%"
		if !REG_ERR! equ 0 (
			echo [INFO] Add MySQL bin to PATH success via registry. >> "%LOGFILE%"
			echo **************** Set system environment variable PATH success ******************
			echo.
		) else (
			echo [ERROR] Add MySQL bin to PATH failed. Registry: !REG_ERR! >> "%LOGFILE%"
			echo ***************** Set system environment variable PATH failed *****************
			echo Set system environment variable PATH failed >> "%LOGFILE%"
			echo.
			pause
			echo [ERROR] Script exited due to PATH update failure. >> "%LOGFILE%"
			exit /b 3
		)
	) else (
		echo [ERROR] Cannot access registry PATH. >> "%LOGFILE%"
		echo ***************** Set system environment variable PATH failed *****************
		echo Set system environment variable PATH failed >> "%LOGFILE%"
		echo.
		pause
		echo [ERROR] Script exited due to PATH update failure. >> "%LOGFILE%"
		exit /b 3
	)
)

REM Initialize MySQL (no password)
echo [INFO] Initializing MySQL database... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysqld" --initialize-insecure
set INIT_ERR=%errorlevel%
echo [INFO] Init MySQL return code: %INIT_ERR% >> "%LOGFILE%"
if %INIT_ERR% neq 0 (
	echo [ERROR] Init MySQL failed, code: %INIT_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to MySQL initialization failure. >> "%LOGFILE%"
	exit /b 4
)
REM Install MySQL service
echo [INFO] Installing MySQL service... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysqld" install mysql
set INSTALL_ERR=%errorlevel%
echo [INFO] Install MySQL service return code: %INSTALL_ERR% >> "%LOGFILE%"
if %INSTALL_ERR% neq 0 (
	echo [ERROR] Install MySQL service failed, code: %INSTALL_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to MySQL service install failure. >> "%LOGFILE%"
	exit /b 5
)
REM Start MySQL service
echo [INFO] Starting MySQL service... >> "%LOGFILE%"
net start mysql
set START_ERR=%errorlevel%
echo [INFO] Start MySQL service return code: %START_ERR% >> "%LOGFILE%"
if %START_ERR% neq 0 (
	echo [ERROR] Start MySQL service failed, code: %START_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to MySQL service start failure. >> "%LOGFILE%"
	exit /b 6
)
REM Set root password
echo [INFO] Setting root password... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysqladmin" -u root password "%MYSQL_ROOT_PASSWORD%"
set PASS_ERR=%errorlevel%
echo [INFO] Set root password return code: %PASS_ERR% >> "%LOGFILE%"
if %PASS_ERR% neq 0 (
	echo [ERROR] Set root password failed, code: %PASS_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to root password set failure. >> "%LOGFILE%"
	exit /b 7
)
REM Create remote root user
echo [INFO] Creating remote root user... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "CREATE USER 'root'@'%' IDENTIFIED BY '${password}';"
set CREATEUSER_ERR=%errorlevel%
echo [INFO] Create remote root user return code: %CREATEUSER_ERR% >> "%LOGFILE%"
if %CREATEUSER_ERR% neq 0 (
	echo [ERROR] Create remote root user failed, code: %CREATEUSER_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to remote root user creation failure. >> "%LOGFILE%"
	exit /b 8
)
REM Grant privileges to remote root user
echo [INFO] Granting privileges to remote root user... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';"
set GRANT_ERR=%errorlevel%
echo [INFO] Grant privileges return code: %GRANT_ERR% >> "%LOGFILE%"
if %GRANT_ERR% neq 0 (
	echo [ERROR] Grant privileges failed, code: %GRANT_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to grant privileges failure. >> "%LOGFILE%"
	exit /b 9
)
REM Change local root password to mysql_native_password
echo [INFO] Changing local root password to mysql_native_password... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "alter user root@'localhost' identified with mysql_native_password by '${password}';"
set ALTER_ERR=%errorlevel%
echo [INFO] Change local root password return code: %ALTER_ERR% >> "%LOGFILE%"
if %ALTER_ERR% neq 0 (
	echo [ERROR] Change local root password failed, code: %ALTER_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to alter user failure. >> "%LOGFILE%"
	exit /b 10
)
echo [INFO] MySQL install and config finished. >> "%LOGFILE%"
echo MySQL install and config finished.
echo.
echo =============================================
echo MySQL installation and configuration complete!
echo You can now use MySQL.
echo Please close this window manually when you are done.
echo =============================================
echo.
echo [INFO] Script completed successfully. >> "%LOGFILE%"
pause >nul

REM Create desktop and start menu shortcuts
echo [INFO] Creating desktop and start menu shortcuts. >> "%LOGFILE%"
set "LnkFile=%USERPROFILE%\\Desktop\\MySQL Command Line Client.lnk"
set "StartMenuLnkFile=%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\MySQL Command Line Client.lnk"
set "IconFile=%MYSQL_HOME%\\mysqlico.ico"
set "SrcFile=%MYSQL_HOME%\\bin\\mysql.exe"
set "Args=-uroot -p"
echo [INFO] Creating shortcut: %LnkFile% >> "%LOGFILE%"
call :CreateShort "%SrcFile%" "%Args%" "%LnkFile%" "%IconFile%"
echo [INFO] Creating shortcut: %StartMenuLnkFile% >> "%LOGFILE%"
call :CreateShort "%SrcFile%" "%Args%" "%StartMenuLnkFile%" "%IconFile%"

goto :eof
:CreateShort
REM %1=target exe, %2=args, %3=lnk path, %4=icon
echo [INFO] Creating shortcut via VBS: %3 >> "%LOGFILE%"
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

// 5.5/5.6 Universal script template (content can be adjusted according to actual 5.5/5.6 requirements)
const batTemplate55_56 = (password) => `@echo off
chcp 65001
REM Set working directory to script location
cd /d %~dp0
REM Enable delayed variable expansion
setlocal enabledelayedexpansion
REM Log start
set "LOGFILE=%~dp0install_log.txt"
echo [INFO] Script started at %date% %time% >> "%LOGFILE%"
REM Check if MySQL service exists
echo [INFO] Checking if MySQL service exists... >> "%LOGFILE%"
SC QUERY mysql > NUL
if %errorlevel% equ 0 (
	echo [INFO] MySQL service already exists. >> "%LOGFILE%"
	echo MySQL service already exists.
	pause
	echo [ERROR] Script exited because MySQL service already exists. >> "%LOGFILE%"
	exit /b 1
) else (
	echo [INFO] MySQL service not found. >> "%LOGFILE%"
)
REM Check if MySQL directory exists
echo [INFO] Checking if mysqld.exe exists at %cd%\\bin\\mysqld.exe >> "%LOGFILE%"
if not exist "%cd%\\bin\\mysqld.exe" (
	echo [ERROR] MySQL bin directory or mysqld.exe not found! >> "%LOGFILE%"
	echo MySQL bin directory or mysqld.exe not found!
	pause
	echo [ERROR] Script exited due to missing mysqld.exe. >> "%LOGFILE%"
	exit /b 2
) else (
	echo [INFO] Found mysqld.exe. >> "%LOGFILE%"
)
echo [INFO] MySQL service not found, start install... >> "%LOGFILE%"
echo MySQL service not found, start install...
REM Set MYSQL_HOME and MYSQL_ROOT_PASSWORD
set "MYSQL_HOME=%cd%"
set "MYSQL_ROOT_PASSWORD=${password}"

REM Set system environment variable MYSQL_HOME
echo ************** Setting system environment variable MYSQL_HOME ***************
echo.
echo [INFO] Setting system environment variable MYSQL_HOME. >> "%LOGFILE%"
SETX /M "MYSQL_HOME" "%MYSQL_HOME%" >> "%LOGFILE%"
if %errorlevel% equ 0 (
	echo [INFO] Set MYSQL_HOME success. >> "%LOGFILE%"
	echo ************** Set system environment variable MYSQL_HOME success ***************
	echo.
) else (
	echo [ERROR] Set MYSQL_HOME failed. >> "%LOGFILE%"
	echo ************** Set system environment variable MYSQL_HOME failed ***************
	echo Set system environment variable MYSQL_HOME failed >> "%LOGFILE%"
	echo.
	pause
	echo [ERROR] Script exited due to SETX failure. >> "%LOGFILE%"
	exit /b 3
)

REM Add MySQL bin to system PATH (simplified approach)
echo ***************** Setting system environment variable PATH *****************
echo.
echo [INFO] Adding MySQL bin to system PATH. >> "%LOGFILE%"
REM Check if MySQL bin is already in PATH
echo %PATH% | find /i "%MYSQL_HOME%\\bin" >nul
if %errorlevel% equ 0 (
	echo [INFO] MySQL bin already in PATH. >> "%LOGFILE%"
	echo ***************** Set system environment variable PATH success *****************
	echo.
) else (
	echo [INFO] MySQL bin not in PATH, adding... >> "%LOGFILE%"
	REM Use registry method directly (no PowerShell dependency)
	reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path >nul 2>&1
	if !errorlevel! equ 0 (
		REM Get current PATH from registry
		for /f "tokens=2,*" %%a in ('reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path 2^>nul') do set "CURRENT_PATH=%%b"
		REM Add MySQL bin to PATH
		reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path /t REG_EXPAND_SZ /d "!CURRENT_PATH!;%MYSQL_HOME%\\bin" /f >nul 2>&1
		set REG_ERR=!errorlevel!
		echo [DEBUG] Registry method exit code: !REG_ERR! >> "%LOGFILE%"
		if !REG_ERR! equ 0 (
			echo [INFO] Add MySQL bin to PATH success via registry. >> "%LOGFILE%"
			echo **************** Set system environment variable PATH success ******************
			echo.
		) else (
			echo [ERROR] Add MySQL bin to PATH failed. Registry: !REG_ERR! >> "%LOGFILE%"
			echo ***************** Set system environment variable PATH failed *****************
			echo Set system environment variable PATH failed >> "%LOGFILE%"
			echo.
			pause
			echo [ERROR] Script exited due to PATH update failure. >> "%LOGFILE%"
			exit /b 3
		)
	) else (
		echo [ERROR] Cannot access registry PATH. >> "%LOGFILE%"
		echo ***************** Set system environment variable PATH failed *****************
		echo Set system environment variable PATH failed >> "%LOGFILE%"
		echo.
		pause
		echo [ERROR] Script exited due to PATH update failure. >> "%LOGFILE%"
		exit /b 3
	)
)

REM Install MySQL service
echo [INFO] Installing MySQL service... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysqld" install mysql
set INSTALL_ERR=%errorlevel%
echo [INFO] Install MySQL service return code: %INSTALL_ERR% >> "%LOGFILE%"
if %INSTALL_ERR% neq 0 (
	echo [ERROR] Install MySQL service failed, code: %INSTALL_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to MySQL service install failure. >> "%LOGFILE%"
	exit /b 4
)
REM Start MySQL service
echo [INFO] Starting MySQL service... >> "%LOGFILE%"
net start mysql
set START_ERR=%errorlevel%
echo [INFO] Start MySQL service return code: %START_ERR% >> "%LOGFILE%"
if %START_ERR% neq 0 (
	echo [ERROR] Start MySQL service failed, code: %START_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to MySQL service start failure. >> "%LOGFILE%"
	exit /b 5
)
REM Set root password
echo [INFO] Setting root password... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysqladmin" -u root password "%MYSQL_ROOT_PASSWORD%"
set PASS_ERR=%errorlevel%
echo [INFO] Set root password return code: %PASS_ERR% >> "%LOGFILE%"
if %PASS_ERR% neq 0 (
	echo [ERROR] Set root password failed, code: %PASS_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to root password set failure. >> "%LOGFILE%"
	exit /b 6
)
REM Create remote root user
echo [INFO] Creating remote root user... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "CREATE USER 'root'@'%' IDENTIFIED BY '${password}';"
set CREATEUSER_ERR=%errorlevel%
echo [INFO] Create remote root user return code: %CREATEUSER_ERR% >> "%LOGFILE%"
if %CREATEUSER_ERR% neq 0 (
	echo [ERROR] Create remote root user failed, code: %CREATEUSER_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to remote root user creation failure. >> "%LOGFILE%"
	exit /b 7
)
REM Grant privileges to remote root user
echo [INFO] Granting privileges to remote root user... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';"
set GRANT_ERR=%errorlevel%
echo [INFO] Grant privileges return code: %GRANT_ERR% >> "%LOGFILE%"
if %GRANT_ERR% neq 0 (
	echo [ERROR] Grant privileges failed, code: %GRANT_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to grant privileges failure. >> "%LOGFILE%"
	exit /b 8
)
REM Change local root password to mysql_native_password
echo [INFO] Changing local root password to mysql_native_password... >> "%LOGFILE%"
"%MYSQL_HOME%\\bin\\mysql" -uroot -p"%MYSQL_ROOT_PASSWORD%" -e "FLUSH PRIVILEGES; SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${password}');"
set ALTER_ERR=%errorlevel%
echo [INFO] Change local root password return code: %ALTER_ERR% >> "%LOGFILE%"
if %ALTER_ERR% neq 0 (
	echo [ERROR] Change local root password failed, code: %ALTER_ERR% >> "%LOGFILE%"
	pause
	echo [ERROR] Script exited due to alter user failure. >> "%LOGFILE%"
	exit /b 9
)
echo [INFO] MySQL install and config finished. >> "%LOGFILE%"
echo MySQL install and config finished.
echo.
echo =============================================
echo MySQL installation and configuration complete!
echo You can now use MySQL.
echo Please close this window manually when you are done.
echo =============================================
echo.
echo [INFO] Script completed successfully. >> "%LOGFILE%"
pause >nul

REM Create desktop and start menu shortcuts
echo [INFO] Creating desktop and start menu shortcuts. >> "%LOGFILE%"
set "LnkFile=%USERPROFILE%\\Desktop\\MySQL Command Line Client.lnk"
set "StartMenuLnkFile=%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\MySQL Command Line Client.lnk"
set "IconFile=%MYSQL_HOME%\\mysqlico.ico"
set "SrcFile=%MYSQL_HOME%\\bin\\mysql.exe"
set "Args=-uroot -p"
echo [INFO] Creating shortcut: %LnkFile% >> "%LOGFILE%"
call :CreateShort "%SrcFile%" "%Args%" "%LnkFile%" "%IconFile%"
echo [INFO] Creating shortcut: %StartMenuLnkFile% >> "%LOGFILE%"
call :CreateShort "%SrcFile%" "%Args%" "%StartMenuLnkFile%" "%IconFile%"

goto :eof
:CreateShort
REM %1=target exe, %2=args, %3=lnk path, %4=icon
echo [INFO] Creating shortcut via VBS: %3 >> "%LOGFILE%"
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

// Main function, select template by first two digits of major version
export function generateInstallAndShortcutBat(password = '123456', version = '8.0') {
	// Only take first two digits of major version
	let mainVer = '8.0';
	const m = version.match(/(\d+\.\d+)/);
	if (m) mainVer = m[1];
	if (mainVer === '8.0' || mainVer === '5.7') {
		return batTemplate80_57(password);
	} else if (mainVer === '5.5' || mainVer === '5.6') {
		return batTemplate55_56(password);
	} else {
		// Return empty string when no suitable template is matched
		return '';
	}
} 