package main

import (
	"encoding/json"
	"fmt"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
)

// Config holds the configuration of the server.
type Config struct {
	DbName       string `json:"dbName"`
	DbUser       string `json:"dbUser"`
	DbPassword   string `json:"dbPassword"`
	DbServer     string `json:"dbServer,omitempty"`
	DbPort       uint   `json:"dbPort,omitempty"`
	ListenerPort string `json:"listenerPort"`
}

type User struct {
	Username  string `db:"username" json:"username"`
	FirstName string `db:"first_name" json:"firstName"`
	LastName  string `db:"last_name" json:"lastName"`
	Password  string `db:"password" json:"password"`
}

type Response struct {
	Status   string `json:"Status"`
	Message  string `json:"Message,omitempty"`
	UserData []User `json:"UserData,omitempty"`
}

var db *sqlx.DB // global and simple
var Logger *log.Logger

func printUsage() {
	exampleConfig := `{
	"dbName":"my-db",
	"dbUser":"my-user",
	"dbPassword":"secret",
	"dbServer":"localhost",
	"dbPort":5432,
	"listenerPort":"8080"
}`
	Logger.Println("Usage: " + path.Base(os.Args[0]) + " configfile")
	Logger.Println("")
	Logger.Println("Example config file:")
	Logger.Println(exampleConfig)
}

func main() {
	if len(os.Args) < 2 {
		printUsage()
		return
	}

	Logger = log.New(os.Stdout, " ", log.Ldate|log.Ltime|log.Lshortfile)

	file, err := os.Open(os.Args[1])
	if err != nil {
		Logger.Println("Error opening config file:", err)
		return
	}
	decoder := json.NewDecoder(file)
	config := Config{}
	err = decoder.Decode(&config)
	if err != nil {
		Logger.Println("Error reading config file:", err)
		return
	}

	db, err = InitializeDatabase(config.DbUser, config.DbPassword, config.DbName, config.DbServer, config.DbPort)
	if err != nil {
		Logger.Println("Error initializing database:", err)
		return
	}

	http.HandleFunc("/", handler)
	if _, err := os.Stat("server.pem"); os.IsNotExist(err) {
		Logger.Fatal("server.pem file not found")
	}
	if _, err := os.Stat("server.key"); os.IsNotExist(err) {
		Logger.Fatal("server.key file not found")
	}
	Logger.Printf("Starting server on port " + config.ListenerPort + "...")
	Logger.Fatal(http.ListenAndServeTLS(":"+config.ListenerPort, "server.pem", "server.key", nil))
}

func InitializeDatabase(username, password, dbname, server string, port uint) (*sqlx.DB, error) {
	connString := fmt.Sprintf("host=%s dbname=%s user=%s password=%s sslmode=disable", server, dbname, username, password)

	db, err := sqlx.Connect("postgres", connString)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func retErr(w http.ResponseWriter, status int) {
	w.WriteHeader(status)
}

func handler(w http.ResponseWriter, r *http.Request) {

	Logger.Println(r.Method, r.URL.Scheme, r.Host, r.URL.RequestURI())
	msg := "None"
	if r.Method == "POST" {
		var u User
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			Logger.Println(err)
		}
		err = json.Unmarshal(body, &u)
		if err != nil {
			Logger.Println(err)
			retErr(w, http.StatusInternalServerError)
			return
		}
		// TODO encrypt passwd before storing.
		sqlString := "INSERT INTO users (username, last_name, first_name, password) VALUES (:username, :last_name, :first_name, :password)"
		_, err = db.NamedExec(sqlString, u)
		if err != nil {
			Logger.Println(err)
			retErr(w, http.StatusInternalServerError)
			return
		}
		msg = "User successully created"
	} else {
		http.Error(w, r.Method+" "+r.URL.Path+" not valid for this microservice", http.StatusNotFound)
	}
	resp := &Response{}
	resp = &Response{Status: "Success", Message: msg}
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.Encode(resp)
}
