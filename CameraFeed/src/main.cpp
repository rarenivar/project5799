#include <cstdlib>
#include <cstring>
#include <iostream>
#include <string>

#include "CommandLine.h"
#include "GetVideo.h"
#include "JPEGFileWriter.h"
#include "JPEGMongoDBWriter.h"

int main(int argc, char **argv)
{
  try
  {
    CommandLine commandLine(argc, argv);
    //    JPEGFileWriter jpegWriter("/tmp/jpegs", "");
    // TODO: need actual MongoDB URI
    JPEGMongoDBWriter jpegWriter("mongodb://localhost:27017",
                                 commandLine.getDebug());
    GetVideo getVideo(commandLine.getURI(), commandLine.getUserName(),
                      commandLine.getPassword(), jpegWriter,
                      commandLine.getDebug());
    getVideo.easyPerform();
  }
  catch (const std::exception &exception)
  {
    std::cerr << argv[0] << ": " << exception.what() << std::endl;
  }

  return 0;
}
