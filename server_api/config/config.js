module.exports = {
    "production": {
        "use_env_variable":"DATABASE_URL",
        "dialect":"postgres",
        "ssl":false,
        "dialectOptions":{
            "ssl":{
                "require":false
            }
        }
    }
}
