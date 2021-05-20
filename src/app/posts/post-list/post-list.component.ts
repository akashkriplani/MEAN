import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

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
  private postsSub: Subscription;
  constructor(public postsService: PostsService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.getPosts();
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
  }

  onDelete(postId: string): void {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.getPosts();
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.getPosts();
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

  private getPosts(): void {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

}
