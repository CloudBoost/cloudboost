describe("Cloud Queue Tests", function() {

	//Use Sample Table. 
	// -> Which has columns : 
	// name : string : required

it("Should return no queue objects when there are no queues inthe database",function(done){
     this.timeout(30000);
     CB.CloudQueue.getAll({
          success : function(response){
               if(!response || response.length ===0)
                    done();
               else
                    done("Empty results not returned.")
          },error : function(error){
               done(error);
          }
     });
 });

  it("Should get the message when expires is set to future date.",function(done){
     this.timeout(30000);
     var queue = new CB.CloudQueue(util.makeString());
     var queueMessage = new CB.QueueMessage();
     var today = new Date();
     var tomorrow = new Date(today);
     tomorrow.setDate(today.getDate()+1);
     //
     queueMessage.expires = tomorrow; // 1hr.  The message will appear after 1 hr.
     queueMessage.message = "data";
     queue.addMessage(queueMessage,{
          success : function(response){
               if(response.expires){
                    queue.getMessage({
                         success : function(response){
                              if(response.expires){
                                  done();
                              }else{
                                   done("Message is null.");
                              }
                         },error : function(error){
                              done(error);
                         }
                    });
               }else{
                    done("Expires is null when set");
               }
          },error : function(error){
               done(error);
          }
     });
 });

 it("Should add data into the Queue",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     queue.addMessage('sample',{
     	success : function(response){
     		if(response instanceof CB.QueueMessage && response.id){
     			if(response.message === 'sample'){
     				done();
     			}
     			else{
     				done("Added but incorrect data");
     			}
     		}else{
     			done("Message added but response is not QueueMessage");
     		}
     	},error : function(error){
     		done(error);
     	}
     });
 });

 it("Should create a queue and delete a queue",function(done){

     this.timeout(30000);
     
     var queue = new CB.CloudQueue(util.makeString());
     queue.create({
          success : function(queue){
              queue.delete({
                    success : function(queue){
                        done();
                    },error : function(error){
                        done(error);
                    }
              });
          },error : function(error){
               done(error);
          }
     });
 });

 it("Should add expires into the queue message.",function(done){
     this.timeout(30000);
     var queue = new CB.CloudQueue(util.makeString());
     var queueMessage = new CB.QueueMessage();
     var today = new Date();
     var tomorrow = new Date(today);
     tomorrow.setDate(today.getDate()+1);
     //
     queueMessage.expires = tomorrow; // 1hr.  The message will appear after 1 hr.
     queueMessage.message = "data";
     queue.addMessage(queueMessage,{
          success : function(response){
               if(response.expires){
                    done();
               }else{
                    done("Expires is null when set");
               }
          },error : function(error){
               done(error);
          }
     });
 });



it("Should add current time as expires into the queue.",function(done){
     this.timeout(40000);
     var queue = new CB.CloudQueue(util.makeString());
     var queueMessage = new CB.QueueMessage();
     queueMessage.expires = new Date(); 
     queueMessage.message = "data";
     queue.addMessage(queueMessage,{
          success : function(response){
               if(response.expires){
                    done();
               }else{
                    done("Expires is null when set");
               }
          },error : function(error){
               done(error);
          }
     });
 });

 it("Should add multiple messages and get all messages.",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     queue.addMessage('sample',{
          success : function(response){
               if(response instanceof CB.QueueMessage && response.id){
                    if(response.message === 'sample'){
                         queue.addMessage('sample1',{
                              success : function(response){
                                   if(response instanceof CB.QueueMessage && response.id){
                                        if(response.message === 'sample1'){                                             
                                             queue.getAllMessages({
                                                  success : function(response){
                                                       
                                                       if(response.length===2){

                                                            var qMessagesList=true;
                                                            for(var i=0;i<response.length;i++){
                                                                 if(response[i] instanceof CB.QueueMessage){
                                                                      qMessagesList=true;
                                                                 }else{
                                                                      qMessagesList=false;
                                                                      break;                                                                      
                                                                 }
                                                            }

                                                            if(qMessagesList){
                                                                 done();
                                                            }else{
                                                                done("Wrong queue message."); 
                                                            }                                                            

                                                       }else{
                                                            done("Wrong queue message");
                                                       }

                                                  },error : function(error){
                                                       done(error);
                                                  }
                                             });
                                        }
                                        else{
                                             done("Added but incorrect data");
                                        }
                                   }else{
                                        done("Message added but response is not QueueMessage");
                                   }
                              },error : function(error){
                                   done(error);
                              }
                         });
                    }
                    else{
                         done("Added but incorrect data");
                    }
               }else{
                    done("Message added but response is not QueueMessage");
               }
          },error : function(error){
               done(error);
          }
     });
 });

 it("Should update data into the Queue",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     queue.addMessage('sample',{
          success : function(response){
               if(response instanceof CB.QueueMessage && response.id){
                    if(response.message === 'sample'){
                         response.message = "Hey!";
                         queue.updateMessage(response,{
                              success : function(response){
                                   if(response instanceof CB.QueueMessage && response.id){
                                        if(response.message === 'Hey!'){
                                            done();
                                        }
                                        else{
                                             done("Added but incorrect data");
                                        }
                                   }else{
                                        done("Message added but response is not QueueMessage");
                                   }
                              },error : function(error){
                                   done(error);
                              }
                         });
                    }
                    else{
                         done("Added but incorrect data");
                    }
               }else{
                    done("Message added but response is not QueueMessage");
               }
          },error : function(error){
               done(error);
          }
     });
 });

 it("Should not update data in the queue which is not saved.",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     try{
          queue.updateMessage('sample',{
               success : function(response){
                    done("Updated unsaved data");
                         
               },error : function(error){
                    done(error);
               }
          });
     }catch(e){
          done();
     }
 });

 it("Should create the Queue",function(done){

     this.timeout(30000);
     var name = util.makeString();
     var queue = new CB.CloudQueue(name);
     queue.create({
          success : function(response){
               if(response instanceof CB.CloudQueue && response.name){
                    if(response.name === name && response.createdAt && response.updatedAt){
                         done();
                    }
                    else{
                         done("Incorrect data");
                    }
               }else{
                    done("Didnot create queue");
               }
          },error : function(error){
               done(error);
          }
     });
 });

 it("Should add an array into the queue",function(done){
 	 this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     queue.addMessage(['sample','sample2'],{
     	success : function(response){
     		if(response.constructor === Array && response.length === 2 && response[0] instanceof CB.QueueMessage && response[0].id && response[1] instanceof CB.QueueMessage && response[1].id){
     			done();
     		}else{
     			done("Message added but response is not QueueMessage");
     		}
     	},error : function(error){
     		done(error);
     	}
     });
 });

 it("Can add multiple messages into the same queue.",function(done){
 	 this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     queue.addMessage(['sample','sample2'],{
     	success : function(response){
     		if(response.constructor === Array && response.length === 2 && response[0] instanceof CB.QueueMessage && response[0].id && response[1] instanceof CB.QueueMessage && response[1].id){
     			//addMessage again. 
     			 queue.addMessage(['sample','sample2'],{
			     	success : function(response){
			     		if(response.constructor === Array && response.length === 2 && response[0] instanceof CB.QueueMessage && response[0].id && response[1] instanceof CB.QueueMessage && response[1].id){
			     			//addMessage again. 
			     			done();
			     		}else{
			     			done("Message added but response is not QueueMessage");
			     		}
			     	},error : function(error){
			     		done(error);
			     	}
			     });

     		}else{
     			done("Message added but response is not QueueMessage");
     		}
     	},error : function(error){
     		done(error);
     	}
     });
 });

it("Should not add null data into the Queue",function(done){
     this.timeout(30000);
     try{

	     var queue = new CB.CloudQueue(util.makeString());
	     queue.addMessage(null,{
	     	success : function(response){
	     		if(response instanceof CB.QueueMessage && response.id){
	     			done();
	     		}else{
	     			done("Message added but response is not QueueMessage");
	     		}
	     	},error : function(error){
	     		done(error);
	     	}
	     });
	     done("Null inserted");
     }catch(e){
     	done();
     }
});

it("Should not create a queue with empty name",function(done){
     this.timeout(30000);
     try{
	     var queue = new CB.CloudQueue();
	     done("Null inserted");
     }catch(e){
     	done();
     }
});

it("Should add and get data from the queue.",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     var message = new CB.QueueMessage('sample');
     //message.delay = 3000;
     queue.addMessage(message,{
          success : function(response){
               if(response instanceof CB.QueueMessage && response.id){
                    if(response.message === 'sample'){
                         //now getMessage it. 
                         queue.getMessage({
                              success : function(message){
                                   if(message.message === 'sample'){
                                        done();
                                   }
                              }, error : function(error){
                                   done(error);
                              }
                         });
                    }
                    else{
                         done("Added but incorrect data");
                    }
               }else{
                    done("Message added but response is not QueueMessage");
               }
          },error : function(error){
               done(error);
          }
     });
 });

it("Should peek.",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     var message = new CB.QueueMessage('sample');
     //message.delay = 3000;
     queue.addMessage(message,{
          success : function(response){
               if(response instanceof CB.QueueMessage && response.id){
                    if(response.message === 'sample'){
                         //now getMessage it. 
                         queue.peekMessage({
                              success : function(message){
                                   if(message.message === 'sample'){
                                       //peekMessage again. 
                                       queue.peekMessage({
                                             success : function(message){
                                                  if(message.message === 'sample'){
                                                      done();
                                                  }
                                             }, error : function(error){
                                                  done(error);
                                             }
                                        });
                                   }
                              }, error : function(error){
                                   done(error);
                              }
                         });
                    }
                    else{
                         done("Added but incorrect data");
                    }
               }else{
                    done("Message added but response is not QueueMessage");
               }
          },error : function(error){
               done(error);
          }
     });
 });

it("Should get the messages in FIFO",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     var message = new CB.QueueMessage('sample1');
     //message.delay = 3000;
     queue.addMessage(message,{
          success : function(response){
               if(response instanceof CB.QueueMessage && response.id){
                    if(response.message === 'sample1'){
                         var message = new CB.QueueMessage('sample2');
                         //message.delay = 3000;
                         queue.addMessage(message,{
                              success : function(response){
                                   if(response instanceof CB.QueueMessage && response.id){
                                        if(response.message === 'sample2'){
                                             //now getMessage it. 
                                             queue.getMessage({
                                                  success : function(message){
                                                       if(message.message === 'sample1'){
                                                            queue.getMessage({
                                                                 success : function(message){
                                                                      if(message.message === 'sample2'){
                                                                           done();
                                                                      }
                                                                 }, error : function(error){
                                                                      done(error);
                                                                 }
                                                            });
                                                       }
                                                  }, error : function(error){
                                                       done(error);
                                                  }
                                             });
                                            
                                        }
                                        else{
                                             done("Added but incorrect data");
                                        }
                                   }else{
                                        done("Message added but response is not QueueMessage");
                                   }
                              },error : function(error){
                                   done(error);
                              }
                         });
                        
                    }
                    else{
                         done("Added but incorrect data");
                    }
               }else{
                    done("Message Added but response is not QueueMessage");
               }
          },error : function(error){
               done(error);
          }
     });
 });

it("Should peek 2 messages at the same time.",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     var message = new CB.QueueMessage('sample1');
     //message.delay = 3000;
     queue.addMessage(message,{
          success : function(response){
               if(response instanceof CB.QueueMessage && response.id){
                    if(response.message === 'sample1'){
                         var message = new CB.QueueMessage('sample2');
                         //message.delay = 3000;
                         queue.addMessage(message,{
                              success : function(response){
                                   if(response instanceof CB.QueueMessage && response.id){
                                        if(response.message === 'sample2'){
                                             //now getMessage it. 
                                             queue.peekMessage(2, {
                                                  success : function(messages){
                                                      if(messages.length ===2 && messages[0].id && messages[1].id){
                                                            done();
                                                      }
                                                  }, error : function(error){
                                                       done(error);
                                                  }
                                             });
                                        }
                                        else{
                                             done("Added but incorrect data");
                                        }
                                   }else{
                                        done("Message added but response is not QueueMessage");
                                   }
                              },error : function(error){
                                   done(error);
                              }
                         });
                    }
                    else{
                         done("Added but incorrect data");
                    }
               }else{
                    done("Message Added but response is not QueueMessage");
               }
          },error : function(error){
               done(error);
          }
     });
 });


it("Should get 2 messages at the same time.",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     var message = new CB.QueueMessage('sample1');
     //message.delay = 3000;
     queue.addMessage(message,{
          success : function(response){
               if(response instanceof CB.QueueMessage && response.id){
                    if(response.message === 'sample1'){
                         var message = new CB.QueueMessage('sample2');
                         //message.delay = 3000;
                         queue.addMessage(message,{
                              success : function(response){
                                   if(response instanceof CB.QueueMessage && response.id){
                                        if(response.message === 'sample2'){
                                             //now getMessage it. 
                                             queue.getMessage(2, {
                                                  success : function(messages){
                                                      if(messages.length ===2 && messages[0].id && messages[1].id){
                                                            done();
                                                      }
                                                  }, error : function(error){
                                                       done(error);
                                                  }
                                             });
                                            
                                        }
                                        else{
                                             done("Add but incorrect data");
                                        }
                                   }else{
                                        done("Message add but response is not QueueMessage");
                                   }
                              },error : function(error){
                                   done(error);
                              }
                         });
                        
                    }
                    else{
                         done("Added but incorrect data");
                    }
               }else{
                    done("Message added but response is not QueueMessage");
               }
          },error : function(error){
               done(error);
          }
     });
 });



it("Should not getMessage message with the delay ",function(done){

     this.timeout(30000);

     var queue = new CB.CloudQueue(util.makeString());
     var message = new CB.QueueMessage('sample');
     message.delay = 3000;
     queue.addMessage(message,{
          success : function(response){
               if(response instanceof CB.QueueMessage && response.id){
                    if(response.message === 'sample'){
                         //now getMessage it. 
                         queue.getMessage({
                              success : function(message){
                                   if(!message){
                                        done();
                                   }
                                   else{
                                        done("Got the message inspite of the delay");
                                   }
                              }, error : function(error){
                                   done(error);
                              }
                         });
                    }
                    else{
                         done("added but incorrect data");
                    }
               }else{
                    done("Message added but response is not QueueMessage");
               }
          },error : function(error){
               done(error);
          }
      });
     });

     it("should give an error if queue doesnot exists.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          //message.delay = 3000;
          queue.getMessage({
               success : function(message){
                   done("Got the message");
               }, error : function(error){
                    done();
               }
          });
     });


     it("should not get the same message twice. ",function(done){
         this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          queue.addMessage(message,{
               success : function(response){
                    if(response instanceof CB.QueueMessage && response.id){
                         if(response.message === 'sample'){
                              //now getMessage it. 
                              queue.getMessage({
                                   success : function(message){
                                        if(message){
                                              queue.getMessage({
                                                  success : function(message){
                                                       if(!message){
                                                           done(); 
                                                       }else{
                                                            done("Got a message.")
                                                       }
                                                  }, error : function(error){
                                                       done(error);
                                                  }
                                             });
                                        }else{
                                             done("Cannot get the message.")
                                        }
                                   }, error : function(error){
                                        done(error);
                                   }
                              });
                         }
                         else{
                              done("Get message but incorrect data");
                         }
                    }else{
                         done("Message get but response is not QueueMessage");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("should be able to get message after the timeout.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          message.timeout =3; //1 sec
          queue.addMessage(message,{
               success : function(response){
                    if(response instanceof CB.QueueMessage && response.id){
                         if(response.message === 'sample'){
                              //now getMessage it. 

                               queue.getMessage({
                                        success : function(message){
                                             if(message.message = 'sample'){
                                                  //getMessage it again.
                                                  setTimeout(function(){
                                                       queue.getMessage({
                                                            success : function(message){
                                                                 if(!message){
                                                                      done("Message is null");
                                                                 }
                                                                 if(message.message = 'sample'){
                                                                      done();
                                                                 }else{
                                                                      done("Cannot get the message");
                                                                 }
                                                            }, error : function(error){
                                                                 done(error);
                                                            }
                                                       });
                                                  },7000);
                                             }else{
                                                  done("Cannot get the message");
                                             }
                                        }, error : function(error){
                                             done(error);
                                        }
                                   });
                              
                             
                         }
                         else{
                              done("added but incorrect data");
                         }
                    }else{
                         done("Message added but response is not QueueMessage");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should be able to get messages after the delay.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          message.delay =1; //1 sec
          queue.addMessage(message,{
               success : function(response){
                    if(response instanceof CB.QueueMessage && response.id){
                         if(response.message === 'sample'){
                              //now getMessage it. 
                              setTimeout(function(){
                                   queue.getMessage({
                                        success : function(message){
                                             if(message.message = 'sample'){
                                                  done();
                                             }else{
                                                  done("Cannot get the message");
                                             }
                                        }, error : function(error){
                                             done(error);
                                        }
                                   });
                              },2000);
                             
                         }
                         else{
                              done("added but incorrect data");
                         }
                    }else{
                         done("Message added but response is not QueueMessage");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });


     it("Should be able to get message with an id",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          message.delay =1; //1 sec
          queue.addMessage(message,{
               success : function(response){
                    if(response instanceof CB.QueueMessage && response.id){
                         if(response.message === 'sample'){
                              //now getMessage it. 
                              
                              queue.getMessageById(response.id,{
                                   success : function(message){
                                        if(message.message = 'sample'){
                                             done();
                                        }else{
                                             done("Cannot get the message");
                                        }
                                   }, error : function(error){
                                        done(error);
                                   }
                              });
                         }
                         else{
                              done("added but incorrect data");
                         }
                    }else{
                         done("Message added but response is not QueueMessage");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should get null when invalid message id is requested.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          message.delay =1; //1 sec
          queue.addMessage(message,{
               success : function(response){
                    if(response instanceof CB.QueueMessage && response.id){
                         if(response.message === 'sample'){
                              //now getMessage it. 
                              
                              queue.getMessageById("sample",{
                                   success : function(message){
                                        if(!message){
                                             done();
                                        }else{
                                             done("Got the wrong message");
                                        }
                                   }, error : function(error){
                                        done(error);
                                   }
                              });
                         }
                         else{
                              done("added but incorrect data");
                         }
                    }else{
                         done("Message added but response is not QueueMessage");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should delete message with message id.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          message.delay =1; //1 sec
          queue.addMessage(message,{
               success : function(response){
                    if(response instanceof CB.QueueMessage && response.id){
                         if(response.message === 'sample'){
                              //now getMessage it. 
                              
                              queue.deleteMessage(response.id,{
                                   success : function(message){
                                        if(message!=null && message.id === response.id){
                                             done();
                                        }else{
                                             done("Error, Null  or wrong message returned.")
                                        }

                                   }, error : function(error){
                                        done(error);
                                   }
                              });
                         }
                         else{
                              done("added but incorrect data");
                         }
                    }else{
                         done("Message added but response is not QueueMessage");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should delete message by passing queueMessage to the function",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          message.delay =1; //1 sec
          queue.addMessage(message,{
               success : function(response){
                    if(response instanceof CB.QueueMessage && response.id){
                         if(response.message === 'sample'){
                              //now getMessage it. 
                              
                              queue.deleteMessage(response,{
                                   success : function(message){
                                        if(message!=null && message.id === response.id){
                                             done();
                                        }else{
                                             done("Error, Null  or wrong message returned.")
                                        }

                                   }, error : function(error){
                                        done(error);
                                   }
                              });
                         }
                         else{
                              done("added but incorrect data");
                         }
                    }else{
                         done("Message added but response is not QueueMessage");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should not get the message after it was deleted",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var message = new CB.QueueMessage('sample');
          message.delay =1; //1 sec
          queue.addMessage(message,{
               success : function(response){
                    if(response instanceof CB.QueueMessage && response.id){
                         if(response.message === 'sample'){
                              //now getMessage it. 
                              
                              queue.deleteMessage(response,{
                                   success : function(message){
                                        if(message!=null && message.id === response.id){
                                             
                                             queue.getMessageById(response.id, {
                                                  success : function(message){
                                                      if(!message)
                                                        done();
                                                       else
                                                        done("Received the message after it was deleted.");
                                                  }, error : function(error){
                                                       done(error);
                                                  }
                                             });

                                        }else{
                                             done("Error, Null  or wrong message returned.")
                                        }

                                   }, error : function(error){
                                        done(error);
                                   }
                              });
                         }
                         else{
                              done("added but incorrect data");
                         }
                    }else{
                         done("Message added but response is not QueueMessage");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should add subscriber to the queue.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var url = "http://sample.sample.com";
          queue.addSubscriber(url,{
               success : function(response){
                    if(response.subscribers.indexOf(url)>=0){
                         done();
                    }else{
                         done("subscribers not added to the queue");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should multiple subscribers to the queue.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var url = ["http://sample.sample.com","http://sample1.cloudapp.net"];
          queue.addSubscriber(url,{
               success : function(response){
                    for(var i=0;i<url.length;i++){
                         if(response.subscribers.indexOf(url[i])===-1){
                              done("Subscribers not added.");
                         }
                    }
                    done();
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should remove subscriber from the queue.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var url ="http://sample1.cloudapp.net";
          queue.removeSubscriber(url,{
               success : function(response){
                    if(response.subscribers.indexOf(url)===-1){
                         done();
                    }else{
                         done("subscribers not added to the queue");
                    }
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should remove multiple subscriber from the queue.",function(done){
          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          var url =["http://sample1.cloudapp.net","http://sample2.cloudapp.net"];
          queue.removeSubscriber(url,{
               success : function(response){
                    for(var i=0;i<url.length;i++){
                         if(response.subscribers.indexOf(url[i])>=0){
                              done("Subscribers not removed.");
                         }
                    }
                    done();
               },error : function(error){
                    done(error);
               }
          });
     });

     it("Should not add subscriber with invalid URL.",function(done){
          this.timeout(30000);
          var queue = new CB.CloudQueue(util.makeString());
          var url = "sample,sample";
          queue.addSubscriber(url,{
               success : function(response){
                   done("Success called with invalid URL");
               },error : function(error){
                   done();
               }
          });
     });

     it("Should add a subscriber and then remove a subscriber from the queue.",function(done){
          this.timeout(30000);
          var queue = new CB.CloudQueue(util.makeString());
          var url = "https://sample.sample.com";
          queue.addSubscriber(url,{
               success : function(response){
                   if(queue.subscribers.length === 1){

                         queue.removeSubscriber(url,{
                              success : function(response){
                                  if(queue.subscribers.length === 0){
                                        done();
                                  }
                              },error : function(error){
                                  done("Failed to remove a subscriber");
                              }
                         });

                   }
               },error : function(error){
                   done("Failed to add a subscriber");
               }
          });
     });


     it("Should delete the queue.",function(done){
          this.timeout(30000);
          var queue = new CB.CloudQueue(util.makeString());
          queue.addMessage("sample",{
               success : function(response){
                   if(response.id){
                       //now delete the queue. 
                       queue.delete({
                              success : function(response){
                                  if(response.name){
                                        //getMessage message from the queue. 
                                        queue.getMessage({
                                             success : function(response){
                                                 if(response.id){
                                                      done("get message from the queue which is deleted.");
                                                 }else{     
                                                    done("get message from deleted queue.");
                                                 }
                                             },error : function(error){
                                                 done();
                                             }
                                        });
                                  }else{     
                                     done("Failed to delete the queue.");
                                  }
                              },error : function(error){
                                  done("Failed to add a subscriber");
                              }
                         });
                   }else{
                      done("Failed to add the message.");
                   }
               },error : function(error){
                   done("Failed to add a subscriber");
               }
          });
     });

     it("Should clear the queue.",function(done){
          this.timeout(30000);
          var queue = new CB.CloudQueue(util.makeString());
          queue.addMessage("sample",{
               success : function(response){
                   if(response.id){
                       //now delete the queue. 
                       queue.clear({
                              success : function(response){
                                  if(response.name){
                                        //getMessage message from the queue. 
                                        queue.getMessage({
                                             success : function(response){
                                                 if(response){
                                                      done("get message from the queue which is deleted.");
                                                 }else{     
                                                    done();
                                                 }
                                             },error : function(error){
                                                 done("Error getting data");
                                             }
                                        });
                                  }else{     
                                     done("Failed to delete the queue.");
                                  }
                              },error : function(error){
                                  done("Failed to clear a message.");
                              }
                         });
                   }else{
                      done("Failed to add a message");
                   }
               },error : function(error){
                   done("Failed to add a message");
               }
          });
     });

     it("Should get the queue.",function(done){
          this.timeout(30000);
          var queue = new CB.CloudQueue(util.makeString());
          queue.addMessage("sample",{
               success : function(response){
                   if(response.id){
                       //now delete the queue. 
                       queue.get({
                              success : function(response){
                                  if(response.id){
                                        //getMessage message from the queue. 
                                       done();
                                  }else{     
                                     done("Failed to get the queue.");
                                  }
                              },error : function(error){
                                  done("Failed to get the message.");
                              }
                         });
                   }else{
                      done("Failed to add  a message");
                   }
               },error : function(error){
                   done("Failed to add a message");
               }
          });
     });

     it("Should get the queue.",function(done){
          this.timeout(30000);
          var name = util.makeString();
          var queue = new CB.CloudQueue(name);
          queue.addMessage("sample",{
               success : function(response){
                   if(response.id){
                       //now delete the queue. 
                       CB.CloudQueue.get(name,{
                              success : function(response){
                                  if(response.id){
                                        //getMessage message from the queue. 
                                       done();
                                  }else{     
                                     done("Failed to get the queue.");
                                  }
                              },error : function(error){
                                  done("Failed to get the message.");
                              }
                         });
                   }else{
                      done("Failed to add  a message");
                   }
               },error : function(error){
                   done("Failed to add a message");
               }
          });
     });

     

     it("Should not get the queue with null name", function(done){
          this.timeout(30000);
          var name = util.makeString();
          var queue = new CB.CloudQueue(name);
          queue.addMessage("sample",{
               success : function(response){
                   if(response.id){
                    try{
                       //now delete the queue. 
                       CB.CloudQueue.get(null,{
                              success : function(response){
                                  if(response.id){
                                        //getMessage message from the queue. 
                                       done();
                                  }else{     
                                     done("Failed to get the queue.");
                                  }
                              },error : function(error){
                                  done("Failed to get the message.");
                              }
                         });
                       done("Error.")
                  }catch(e){
                    done();
                  }

                   }else{
                      done("Failed to add  a message");
                   }
               },error : function(error){
                   done("Failed to add a message");
               }
          });
     });

     it("Should get All Queues", function(done){
          this.timeout(30000);
          
          CB.CloudQueue.getAll({
               success : function(response){
                  if(response.length>0){
                    if(response[0].size){
                         done();
                    }else{
                         done("Size not retrieved.")
                    }
                  }else{
                    done("Error getting queues.");
                  }
               },error : function(error){
                   done("Failed to add a message");
               }
          });
     });

     it("Should not get the queue which does not exist",function(done){
          this.timeout(30000);
          var queue = new CB.CloudQueue(util.makeString());
             queue.get({
                    success : function(response){
                       done("Got the queue which does not exist");
                    },error : function(error){
                        done();
                    }
               });
          });


     it("Should refresh message timeout with timeout specified. ",function(done){
          this.timeout(30000);
              var queue = new CB.CloudQueue(util.makeString());
              queue.addMessage('sample',{
                 success : function(response){
                      if(response instanceof CB.QueueMessage && response.id){
                           if(response.message === 'sample'){
                                queue.refreshMessageTimeout(response,3600,{
                                success : function(response){
                                     if(response instanceof CB.QueueMessage && response.id){
                                          if(response.timeout === 3600){
                                               done();
                                          }
                                          else{
                                               done("Refreshed the timeout but didnot return the data.");
                                          }
                                     }else{
                                          done("Message added but response is not QueueMessage");
                                     }
                                },error : function(error){
                                     done(error);
                                }
                             });
                           }
                           else{
                                done("added but incorrect data");
                           }
                      }else{
                           done("Message added but response is not QueueMessage");
                      }
                 },error : function(error){
                      done(error);
                 }
              });
     });

     it("Should refresh message timeout wiht timeout NOT specified. ",function(done){
         this.timeout(30000);
         var queue = new CB.CloudQueue(util.makeString());
              queue.addMessage('sample',{
                 success : function(response){
                      if(response instanceof CB.QueueMessage && response.id){
                           if(response.message === 'sample'){
                                queue.refreshMessageTimeout(response,{
                                success : function(response){
                                     if(response instanceof CB.QueueMessage && response.id){
                                          if(response.timeout === 1800){
                                               done();
                                          }
                                          else{
                                               done("Refreshed the timeout but didnot return the data.");
                                          }
                                     }else{
                                          done("Message added but response is not QueueMessage");
                                     }
                                },error : function(error){
                                     done(error);
                                }
                             });
                           }
                           else{
                                done("added but incorrect data");
                           }
                      }else{
                           done("Message added but response is not QueueMessage");
                      }
                 },error : function(error){
                      done(error);
                 }
              });
     });

     it("Should not refresh message timeout when message is get form the queue.",function(done){
            this.timeout(30000);
         var queue = new CB.CloudQueue(util.makeString());
              queue.addMessage('sample',{
                 success : function(response){
                      if(response instanceof CB.QueueMessage && response.id){
                           if(response.message === 'sample'){
                              queue.getMessage({
                                     success : function(response){
                                          if(response instanceof CB.QueueMessage && response.id){
                                               queue.refreshMessageTimeout(response,{
                                                    success : function(response){
                                                         done("Error, Success called.")
                                                    },error : function(error){
                                                         done()
                                                    }
                                                 });
                                          }else{
                                               done("Message cant be get out of the queue.");
                                          }
                                     },error : function(error){
                                          done(error);
                                     }
                                  });
                                
                           }
                           else{
                                done("added but incorrect data");
                           }
                      }else{
                           done("Message added but response is not QueueMessage");
                      }
                 },error : function(error){
                      done(error);
                 }
              });
     });

     it("Should update the queue.",function(done){

          this.timeout(30000);

          var queue = new CB.CloudQueue(util.makeString());
          queue.addMessage('sample',{
            success : function(response){
                 if(response instanceof CB.QueueMessage && response.id){
                      if(response.message === 'sample'){
                           //now change the type of the queue to addMessage. 
                           queue.addSubscriber("https://www.google.com", {
                              success : function(){
                                   queue.type = "push";
                                     queue.update({
                                          success : function(response){
                                               if(response.type === "push"){
                                                  done();
                                               }else{
                                                   done("Error. Didnot update the queue.")
                                               }
                                          },error : function(error){
                                               done(error);
                                          }
                                        });
                              }, error : function(){
                                   done("Canot add subscriber to the queue");
                              }
                           });
                      }
                      else{
                           done("added but incorrect data");
                      }
                 }else{
                      done("Message added but response is not QueueMessage");
                 }
            },error : function(error){
                 done(error);
            }
          });
      });

     after(function(){
        CB.appKey = CB.jsKey;
     });
});