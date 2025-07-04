// MySQL my.ini 模板，根据版本导出

// 1. 配置内容池（只保留唯一内容，无重复）
const myiniConfigPool = {
  '8.0.11': `[mysqld]\n# 设置3306端口\nport=3306\n# 设置mysql的安装目录\nbasedir={basedir}   # 切记此处一定要用双斜杠\\，单斜杠我这里会出错，不过看别人的教程，有的是单斜杠。自己尝试吧\n# 设置mysql数据库的数据的存放目录\ndatadir={datadir}   # 此处同上\n# 允许最大连接数\nmax_connections=200\n# 允许连接失败的次数。这是为了防止有人从该主机试图攻击数据库系统\nmax_connect_errors=10\n# 服务端使用的字符集默认为UTF8\ncharacter-set-server=utf8\n# 创建新表时将使用的默认存储引擎\ndefault-storage-engine=INNODB\n# 默认使用\"mysql_native_password\"插件认证\ndefault_authentication_plugin=mysql_native_password\n[mysql]\n# 设置mysql客户端默认字符集\ndefault-character-set=utf8\n[client]\n# 设置mysql客户端连接服务端时默认使用的端口\nport=3306\ndefault-character-set=utf8\n`,
  '5.7.20': `[mysql]\n# 设置mysql客户端默认字符集\ndefault-character-set=utf8\n \n[mysqld]\n# 设置3306端口\nport = 3306\n# 设置mysql的安装目录\nbasedir={basedir}\n# 设置mysql数据库的数据的存放目录\ndatadir={datadir}\n# 允许最大连接数\nmax_connections=200\n# 服务端使用的字符集默认为8比特编码的latin1字符集\ncharacter-set-server=utf8\n# 创建新表时将使用的默认存储引擎\ndefault-storage-engine=INNODB\n`,
  '5.5.62': `[client]\nport=3306\ndefault-character-set=utf8\n[mysqld]\nport=3306\ncharacter_set_server=utf8\nbasedir={basedir}\n#解压目录\ndatadir={datadir}\n#解压目录下data目录\nsql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES\n[WinMySQLAdmin]\n{basedir}\\bin\\mysqld.exe\n`,
  '5.6.51': `[mysql]\n# 设置mysql客户端默认字符集\ndefault-character-set=utf8\n[mysqld]\n#设置3306端口\nport = 3306\n# 设置mysql的安装目录\nbasedir={basedir}\n# 设置mysql数据库的数据的存放目录\ndatadir={datadir}\n# 允许最大连接数\nmax_connections=200\n# 服务端使用的字符集默认为8比特编码的latin1字符集\ncharacter-set-server=utf8\n# 创建新表时将使用的默认存储引擎\ndefault-storage-engine=INNODB\n\nsql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES \n`,
  '8.0': `[client]\n# 设置mysql客户端默认字符集\ndefault-character-set=utf8mb4\n\n[mysql]\n# 设置mysql客户端默认字符集\ndefault-character-set=utf8mb4\n\n[mysqld]\n# 忽略大小写\nlower_case_table_names=1\n\n# 设置mysql客户端连接服务端时默认使用的端口3306\nport = 3306\n\n# 设置mysql的安装目录\nbasedir = {basedir}\n\n# 设置mysql数据库的数据的存放目录\ndatadir = {datadir}\n\n# 允许最大连接数\nmax_connections=200\n\n# 允许连接失败的次数。这是为了防止有人从该主机试图攻击数据库系统\nmax_connect_errors=100\n\n# 服务端使用的字符集默认为8比特编码的latin1字符集【mysql8.0】\ncharacter_set_server = utf8mb4\n\n# 创建新表时将使用的默认存储引擎\ndefault-storage-engine=INNODB\n\n# 默认使用\"mysql_native_password\"插件认证【mysql8.0】\n# default_authentication_plugin=mysql_native_password??\nauthentication_policy=*\n\n# 跳过安全检查,如果跳过，可能不能执行修改用户密码sql语句\n#skip-grant-tables\n\n#开启查询缓存\n#explicit_defaults_for_timestamp=true\n\n# 创建模式 NO_AUTO_CREATE_USER再MYSQL8.0中已经被移除，不能再8.0以上版本配置【mysql8.0】\n# sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES \n# sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION\nsql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION\n`,
  '5.7': `[mysql]\n# 设置mysql客户端默认字符集\ndefault-character-set=utf8\n \n[mysqld]\n# 设置3306端口\nport = 3306\n# 设置mysql的安装目录\nbasedir={basedir}\n# 设置mysql数据库的数据的存放目录\ndatadir={datadir}\n# 允许最大连接数\nmax_connections=200\n# 服务端使用的字符集默认为8比特编码的latin1字符集\ncharacter-set-server=utf8\n# 创建新表时将使用的默认存储引擎\ndefault-storage-engine=INNODB\n`,
  '5.6': `[mysql]\n# 设置mysql客户端默认字符集\ndefault-character-set=utf8\n[mysqld]\n#设置3306端口\nport = 3306\n# 设置mysql的安装目录\nbasedir={basedir}\n# 设置mysql数据库的数据的存放目录\ndatadir={datadir}\n# 允许最大连接数\nmax_connections=200\n# 服务端使用的字符集默认为8比特编码的latin1字符集\ncharacter-set-server=utf8\n# 创建新表时将使用的默认存储引擎\ndefault-storage-engine=INNODB\n\nsql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES \n`,
  '5.5': `[client]\nport=3306\ndefault-character-set=utf8\n[mysqld]\nport=3306\ncharacter_set_server=utf8\nbasedir={basedir}\n#解压目录\ndatadir={datadir}\n#解压目录下data目录\nsql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES\n[WinMySQLAdmin]\n{basedir}\\bin\\mysqld.exe\n`,
};

// 2. 版本与配置的映射（所有内容相同的版本都指向唯一key）
export const myiniTemplates = {
  '8.0.11': myiniConfigPool['8.0.11'],
  '8.0.36': myiniConfigPool['8.0'],
  '8.0.39': myiniConfigPool['8.0'],
  '8.0.40': myiniConfigPool['8.0'],
  '5.7.20': myiniConfigPool['5.7.20'],
  '5.5.62': myiniConfigPool['5.5.62'],
  '5.6.51': myiniConfigPool['5.6.51'],
  '8.0': myiniConfigPool['8.0'],
  '5.7': myiniConfigPool['5.7'],
  '5.6': myiniConfigPool['5.6'],
  '5.5': myiniConfigPool['5.5'],
};

// 3. 渲染函数，动态拼接头部注释
export function renderMyIni(version, config) {
  return `# MySQL ${version} 专用模板\n${config}`;
}