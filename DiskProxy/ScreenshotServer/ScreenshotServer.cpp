#include <vector>
#include <iostream>
#include <string>
#include <algorithm>
#include <cassert>

#pragma comment(lib, "Ws2_32.lib")

#include "ScreenshotServer.h"

ScreenshotServer::ScreenshotServer(short port) : port_(port), log_("log.txt")
{
	log("Created ScreenshotServer");

	actions_.push_back("Simple screenshot");
	actions_.push_back("Screen a window");
	actions_.push_back("Screen selected area");
}

void ScreenshotServer::log(const std::string& msg)
{
	log_ << msg << std::endl;
	std::cout << msg << std::endl;
}

SOCKET ScreenshotServer::listen()
{
	WSADATA wsaData;
	int goodStart = WSAStartup(MAKEWORD(2, 2), &wsaData);
	if (goodStart != 0)
	{
		std::string message = "Could not start WSA: " + std::to_string(goodStart) + "\n";
		log_ << message;
		throw InitException(message);
	}

	addrinfo* result = nullptr, *ptr = nullptr, hints;
	ZeroMemory(&hints, sizeof(hints));

	hints.ai_family = AF_INET;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_protocol = IPPROTO_TCP;
	hints.ai_flags = AI_PASSIVE;

	int goodResolve = getaddrinfo(NULL, std::to_string(port_).c_str(), &hints, &result);
	if (goodResolve != 0)
	{
		WSACleanup();
		throw InitException("Could not resolve addrinfo: " + std::to_string(goodResolve));
	}

	SOCKET serverSocket = INVALID_SOCKET;
	serverSocket = socket(result->ai_family, result->ai_socktype, result->ai_protocol);

	if (serverSocket == INVALID_SOCKET)
	{
		freeaddrinfo(result);
		WSACleanup();
		throw new InitException("Could not create server socket: " + std::to_string(WSAGetLastError()));
	}

	int goodBind = bind(serverSocket, result->ai_addr, static_cast<int>(result->ai_addrlen));
	if (goodBind != 0)
	{
		freeaddrinfo(result);
		closesocket(serverSocket);
		WSACleanup();
		throw InitException("Could not bind socket: " + std::to_string(WSAGetLastError()));
	}

	freeaddrinfo(result);

	if ( ::listen(serverSocket, SOMAXCONN) == SOCKET_ERROR)
	{
		closesocket(serverSocket);
		WSACleanup();
		throw InitException("Could not listen on socket: " + std::to_string(WSAGetLastError()));
	}

	return serverSocket;
}

void ScreenshotServer::accept()
{
	SOCKET socket = listen();

	while (true)
	{
		SOCKET clientSocket = INVALID_SOCKET;
		clientSocket = ::accept(socket, NULL, NULL);
		if (clientSocket == INVALID_SOCKET)
		{
			closesocket(clientSocket);
			WSACleanup();
			throw AcceptException("Could not accept on client socket: " + std::to_string(WSAGetLastError()));
		}

		process(clientSocket);
	}
}

void ScreenshotServer::process(SOCKET socket)
{
	const int BUFFER_SIZE = 512;
	int result = 0;
	std::vector<char> buffer(BUFFER_SIZE); 

	do
	{
		result = recv(socket, &buffer[0], buffer.size(), 0);
		if (result > 0)
		{
			log("Recieved " + std::to_string(result) + " bytes from " + std::to_string(socket));
			assert(result == sizeof(int));

			unsigned int recieved = *(&buffer[0]);
			log("As " + std::to_string(recieved));

			if (recieved >= actions_.size())
			{
				log("Bad number recieved: " + std::to_string(recieved) + " >= " + std::to_string(actions_.size()));
				continue;
			}

			log("Making action: " + actions_[recieved]);
			
			result = shutdown(socket, SD_RECEIVE);
			if (result == SOCKET_ERROR)
			{
				log("Could not shutdown socket connection: " + std::to_string(result));
				closesocket(socket);
				WSACleanup();
				throw AcceptException("Shutdown failed!");
			}
		}
		else if (result == 0)
		{
			log("Closing connection with: " + std::to_string(socket)); 
		}
		else
		{
			closesocket(socket);
			WSACleanup();
			throw AcceptException("Recv failed on: " + std::to_string(socket) + "\n");
		}
	} while (result > 0);
}