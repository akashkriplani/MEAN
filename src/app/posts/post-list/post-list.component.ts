import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';
import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  currentPage = 1;
  isLoading = false;
  pageSizeOptions = [1, 2, 5, 10];
  postsPerPage = 2;
  posts: Post[] = [];
  totalPosts = 0;
  userIsAuthenticated = false;
  userId: string;
  private postsSub: Subscription;
  private authSub: Subscription;

  constructor(public postsService: PostsService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.getPosts();
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
        if (this.totalPosts > 0 && this.posts?.length === 0) {
          this.isLoading = true;
          this.currentPage = 1;
          this.getPosts();
        }
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  onDelete(postId: string): void {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.getPosts();
    }, () => {
      this.isLoading = false;
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.getPosts();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.postsSub.unsubscribe();
  }

  private getPosts(): void {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

}
